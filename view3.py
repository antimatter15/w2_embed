from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
import logging
from waveapi import oauth


def _hash(value):
  """return b64encoded sha1 hash of value."""
  import base64
  try:
    hashlib = __import__('hashlib') # 2.5
    hashed = hashlib.sha1(value)
  except ImportError:
    import sha # deprecated
    hashed = sha.sha(value)
  return base64.b64encode(hashed.digest())
  

def handleRPC(post_body):
    CONSUMER_KEY = 'DIZIZWHEREURKEYZGO'
    CONSUMER_SECRET = 'PUTURSECREKTZHEAR'
    
    server_rpc_base = 'http://www-opensocial.googleusercontent.com/api/rpc'
    
    body_hash = _hash(post_body)
    params = {
      'oauth_consumer_key': 'google.com:' + CONSUMER_KEY,
      'oauth_timestamp': oauth.generate_timestamp(),
      'oauth_nonce': oauth.generate_nonce(),
      'oauth_version': oauth.OAuthRequest.version,
      'oauth_body_hash': body_hash,
    }
    
    
    _oauth_signature_method = oauth.OAuthSignatureMethod_HMAC_SHA1()
    _oauth_consumer = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)
                                               
                                               
    oauth_request = oauth.OAuthRequest.from_request('POST',
                                                    server_rpc_base,
                                                    parameters=params)
    oauth_request.sign_request(_oauth_signature_method,
                               _oauth_consumer,
                               None)
   
    head = {'Content-type': 'application/json'}
    
    result = urlfetch.fetch(url=oauth_request.to_url(),
                   payload = post_body,
                   method = urlfetch.POST,
                   headers = head,
                   deadline = 10,
                   allow_truncated = True)
    return result.content


class RPC(webapp.RequestHandler):
  def post(self):
    if self.request.get('jsonpost') not in ['', None]:
      from google.appengine.api import memcache
      rpcdata = handleRPC(self.request.get('p'))
      memcache.set(self.request.get('jsonpost'), rpcdata, time = 60)
      self.response.out.write(str(len(rpcdata)) + self.request.get('jsonpost'))
    else:
      rpcdata = handleRPC(self.request.body)
      self.response.out.write(rpcdata)
    
  def get(self):
    self.response.headers['content-type'] = 'text/javascript'
    if self.request.get('jsonpost') not in ['', None]:
      from google.appengine.api import memcache
      self.response.out.write(self.request.get('jsonp','callback')+'('+memcache.get(self.request.get('jsonpost')).decode('utf-8')+')')
    else:
      self.response.out.write(self.request.get('jsonp','callback')+'('+handleRPC(self.request.get('p')).decode('utf-8')+')')
    
    
application = webapp.WSGIApplication(
                                     [('/rpc', RPC)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
