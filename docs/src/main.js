import SwaggerUI from 'swagger-ui'
import 'swagger-ui/dist/swagger-ui.css'
import apidoc from '../apiDoc.json'

SwaggerUI({
  spec: apidoc,
  dom_id: '#app'
})