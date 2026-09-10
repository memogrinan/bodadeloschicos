#!/bin/bash
cd "$(dirname "$0")"
echo "========================================="
echo "   Iniciando Servidor Local de la Boda   "
echo "========================================="
echo "Abre tu navegador en: http://localhost:8080"
echo "Para detener el servidor, presiona Ctrl + C"
echo "========================================="
ruby -e "
require 'webrick'

class NoSendfileHandler < WEBrick::HTTPServlet::FileHandler
  def do_GET(req, res)
    super
    if res.body.respond_to?(:read)
      res.body = res.body.read
    end
  end
end

server = WEBrick::HTTPServer.new(Port: 8080, DocumentRoot: Dir.pwd)
server.mount('/', NoSendfileHandler, Dir.pwd)

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }
server.start
"
