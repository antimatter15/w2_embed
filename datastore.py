from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
import logging
from google.appengine.ext import db

class Wave(db.Model):
    title = db.StringProperty()
    waveid = db.StringProperty()

def findByTitle(title):
  waves = db.GqlQuery("SELECT * FROM Wave WHERE title = :1", title)
  return waves.get()

class getsetID(webapp.RequestHandler):
  def get(self):
    if findByTitle(self.request.get('title')) is None and self.request.get('title') not in [None, ''] and self.request.get('waveid') not in [None, '']:
      Wave(title=self.request.get('title'),
          waveid=self.request.get('waveid')).put()
      self.response.out.write('/*DONE*/')
    else:
      self.response.out.write('/*INVALID*/')
    wave = findByTitle(self.request.get('title'))
    self.response.headers['content-type'] = 'text/javascript'
    if wave is not None:
      self.response.out.write(self.request.get('jsonp','callback')+'("'+str(wave.waveid).replace('"','')+'")')
    else:
      self.response.out.write(self.request.get('jsonp','callback')+'(null)')
    
    
application = webapp.WSGIApplication(
                                     [('/db/op', getsetID)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
