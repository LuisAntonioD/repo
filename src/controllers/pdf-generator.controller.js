'use strict'

const moment = require('moment')
const pool = require('../connection')
const Admintorre = require('../controllers/amintorreclass.controller')
const pdf = require('pdf-creator-node')

class Pdf extends Admintorre {

	html = false
    encabezado  = ""
    options = {
        orientation: "portrait",
        border: "10mm"
    }
    options_acuse_administracion = {
        format: 'Letter',
        orientation: 'portrait',
        border: '5mm'
    }

    constructor(req, res) {
        super()
        this.req = req
        this.res = res
    }


    async creaPdf2(html, pdfData = null, type = 'buffer', header = null, css = null, style_body = null) {
        this.html = html
        let errors = [], data = [], response = {}

            var document = {
                html: this.html,
                data: {
                },
                type: type,
            }

            if (pdfData) {
                document.data = pdfData
            }

            let buffer = await pdf.create(document, this.options).then((res) => {
                return res
            }).catch((error) => {
                console.error(error)
            })

            let tmpObj = {}
            tmpObj.file = buffer.toString('base64')
            tmpObj.size = buffer.toString().length
            tmpObj.type = 'application/pdf'

            data.push(tmpObj)

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }

        return response
    }
    
    async creaPdf(html, pdfData = null, type = 'buffer', header = null, css = null, style_body = null,id_empresa = null, format = 'Letter') {
        this.options.format = format
        this.html = html
        let errors = [], data  = [], response = {}
        
        let resHeader = await this.setHeader(header,id_empresa)
    
        
        if(resHeader.success){

        let resFooter = await this.setFooter();
        
       

        if (errors.length === 0) {
            this.html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <style>
                    .factura .titulo{
                        text-align: end;
                        font-size: 8px;
                        color: #000000;
                        margin-bottom: -1px;
                        font-weight: bold;
                      }
                    </style>
                    <link id="pagestyle" href="${this.portalUrl}/frontend/assets/css/soft-ui-dashboard.css?v=1.0.4" rel="stylesheet" />
                    <link href="${this.portalUrl}/frontend/assets/admintorre/${(css == null) ?'osxReporte.css' : css}" rel="stylesheet" />
                </head>
                <body class="body"${style_body}>
                    ${this.html}
                </body>
                </html>
            `
            var document = {
                html: this.html,
                data: {
                },
                type: type,
            }
    
            if(pdfData){
                document.data = pdfData
            }

            let buffer = await pdf.create(document, this.options).then((res) => {
                return res
            }).catch((error) => {
                console.error(error)
            })
            
            let tmpObj = {}
            tmpObj.file=buffer.toString('base64')
            tmpObj.size=buffer.toString().length
            tmpObj.type='application/pdf'
    
            data.push(tmpObj)
        }
        } else
            errors.push('Se produjo un error al generar el encabezado: ' + resHeader.errors.join('<br />'))
        
        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
        
        return response
    }

    async creaPdfAcuse(html, pdfData = null, type = 'buffer', header = null, css = null, style_body = null,id_empresa = null, format = 'Letter', encabezado) {
        this.options.format = format
        this.html = html
        this.encabezado = encabezado
        let errors = [], data  = [], response = {}
        
        let resHeader = await this.setHeaderAcuse(encabezado)
        let resFooter = await this.setFooterAcuse()
        
        
        if(resHeader && resFooter){

        
       

        if (errors.length === 0) {
            this.html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <style>
                    .factura .titulo{
                        text-align: end;
                        font-size: 8px;
                        color: #000000;
                        margin-bottom: -1px;
                        font-weight: bold;
                      }
                    </style>
                    <link id="pagestyle" href="${this.portalUrl}/frontend/assets/css/soft-ui-dashboard.css?v=1.0.4" rel="stylesheet" />
                    <link href="${this.portalUrl}/frontend/assets/admintorre/${(css == null) ?'osxReporte.css' : css}" rel="stylesheet" />
                </head>
                <body class="body"${style_body}>
                    ${this.html}
                </body>
                </html>
            `
            var document = {
                html: this.html,
                data: {
                },
                type: type,
            }
            this.options_acuse_administracion = {
                ...this.options_acuse_administracion,
                header: resHeader,
                footer: resFooter
            }
    
            if(pdfData){
                document.data = pdfData
            }

            let buffer = await pdf.create(document, this.options_acuse_administracion).then((res) => {
                return res
            }).catch((error) => {
                console.error(error)
            })
            
            let tmpObj = {}
            tmpObj.file=buffer.toString('base64')
            tmpObj.size=buffer.toString().length
            tmpObj.type='application/pdf'
    
            data.push(tmpObj)
        }
        } else
            errors.push('Se produjo un error al generar el encabezado: ' + resHeader.errors.join('<br />'))
        
        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
        
        return response
    }

    async creaPdfAcuseTransito(html, pdfData = null, type = 'buffer', header = null, css = null, style_body = null,id_empresa = null, format = 'Letter', encabezado) {
        this.options.format = format
        this.html = html
        this.encabezado = encabezado
        let errors = [], data  = [], response = {}
        
        let resHeader = await this.setHeaderAcuseTransito(encabezado)
        let resFooter = await this.setFooterAcuseTransito()
        
        
        if(resHeader && resFooter){

        
       

        if (errors.length === 0) {
            this.html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <style>
                    .factura .titulo{
                        text-align: end;
                        font-size: 8px;
                        color: #000000;
                        margin-bottom: -1px;
                        font-weight: bold;
                      }
                    </style>
                    <link id="pagestyle" href="${this.portalUrl}/frontend/assets/css/soft-ui-dashboard.css?v=1.0.4" rel="stylesheet" />
                    <link href="${this.portalUrl}/frontend/assets/admintorre/${(css == null) ?'osxReporte.css' : css}" rel="stylesheet" />
                </head>
                <body class="body"${style_body}>
                    ${this.html}
                </body>
                </html>
            `
            var document = {
                html: this.html,
                data: {
                },
                type: type,
            }
            this.options_acuse_administracion = {
                ...this.options_acuse_administracion,
                header: resHeader,
                footer: resFooter
            }
    
            if(pdfData){
                document.data = pdfData
            }

            let buffer = await pdf.create(document, this.options_acuse_administracion).then((res) => {
                return res
            }).catch((error) => {
                console.error(error)
            })
            
            let tmpObj = {}
            tmpObj.file=buffer.toString('base64')
            tmpObj.size=buffer.toString().length
            tmpObj.type='application/pdf'
    
            data.push(tmpObj)
        }
        } else
            errors.push('Se produjo un error al generar el encabezado: ' + resHeader.errors.join('<br />'))
        
        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
        
        return response
    }

    async setHeader(header,id_empresa) {
        let errors = [], data  = [], response = {},printLogo=1

        if (!header)
        {
            id_empresa = id_empresa ? id_empresa : 1
            var resDatosAdmon = await this.getDatosAdministracion(id_empresa)
            
            if(resDatosAdmon.success){
              
                header =  {
                    height: "0mm",  /*
                    contents: `
                        <table style="font-size:9px;" border="0" cellpading="0" cellspacing="0" align="center" width="100%">
                            <thead>
                                <tr>
                                    <td class="w-30" align="left">
                                        &nbsp;&nbsp;<img src="${this.portalUrl}/frontend/assets/img/${resDatosAdmon.data.heraldica_admon}" height="50px">
                                    </td>
                                    <td class="w-40" align="center">
                                        <div class="text-center">
                                            <span><b>${resDatosAdmon.data.titulo ? resDatosAdmon.data.titulo : ''} ${resDatosAdmon.data.razon_social}</b></span><br />
                                            <span><b>${resDatosAdmon.data.rfc}</b></span><br />
                                            <span><b>${resDatosAdmon.data.puesto ? resDatosAdmon.data.puesto : ''} ${resDatosAdmon.data.registro ? resDatosAdmon.data.registro : ''}</b></span><br />
                                            <span>${resDatosAdmon.data.cedula ? resDatosAdmon.data.cedula : ''}</span>
                                        </div>
                                    </td>
                                    <td class="w-30 text-end">
                                        <span>${resDatosAdmon.data.direccion ? resDatosAdmon.data.direccion : ''}</span><br />
                                        <span>${resDatosAdmon.data.telefonos ? resDatosAdmon.data.telefonos : ''}<br />${resDatosAdmon.data.website ? resDatosAdmon.data.website : ''}</span>
                                    </td>
                                </tr>
                            </thead>
                        </table>
                    `,
                    */
                }
            } else 
                errors.push(resDatosAdmon.errors.join('<br />'))
        } else {
            header =  {
                height: "5mm",
                contents: header,
            }
            printLogo=0
        } 

        if(header && !errors.length){
            this.options.header = header
            if (printLogo == 1) {
                this.html = `<img src="${this.portalUrl}/frontend/assets/img/${resDatosAdmon.data.heraldica_admon}" style="display: none;">` + this.html
            }
        }

        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
        
        return response
    }

    async setHeaderAcuse(encabezado) {
       
            
                let header =  {
                    height: "40mm",  
                    contents: encabezado
                }
        

      
        
        return header
    }

    async setHeaderAcuseTransito(encabezado) {
       
            
        let header =  {
            height: "60mm",  
            contents: encabezado
        }




        return header
    }

    async setFooter() {
        let errors = [], response = {};
    
        
            this.options.footer = {
                height: "1mm",
                contents: `<div style="width: 100%; display: flex; justify-content: center; font-size: 6pt; position: relative;">
                <div style="position: absolute; left: 0; width: 100%; text-align: center;">
                    
                </div>
                <div style="position: absolute; right: 0; text-align: right;">
                    P&aacute;gina {{page}} de {{pages}}
                </div>
            </div>`
            };
        
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false
        };
        
        return response;
    }

    async setFooterAcuse() {
    
        
            let footer = {
                height: "8mm",
                contents: `<div style="width: 100%; display: flex; justify-content: center; font-size: 8px; position: relative;margin-top:50px;">
                <div style="position: absolute; left: 0; width: 100%; text-align: center;">
                    Esta es una prueba de uso de footer acuse
                </div>
                <div style="position: absolute; right: 0; text-align: right;">
                    P&aacute;gina {{page}} de {{pages}}
                </div>
                
            </div>`
            };
        

            return footer
       
    }

    async setFooterAcuseTransito() {
    
        /*
        let footer = {
            height: "40mm",
            contents: `
            <div style="width: 100%; display: flex; justify-content: center; font-size: 6pt; position: relative;margin-top:50px;">
                <div style="position: absolute; right: 0; width: 30%; text-align: justify;line-height: 2;">
                    <span>Recibido por:</span><br />
                    <span>Nombre:</span><br />
                    <span>Fecha y hora:</span><br />
                    <span>Firma</span><br />
                </div>
                <div style="position: absolute; text-align: center;width: 10%;margin-top:35px">
                    P&aacute;gina {{page}} de {{pages}}
                </div>
            </div>`
        };
        */
        let footer = {
            height: "100mm",
            contents: `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; font-size: 6pt; position: relative; margin-top: 115px;">
                <div style="width: 100%; text-align: center; line-height: 1.8; padding: 20px; background-color: #f0f0f0; border-radius: 5px; min-height: 25mm;">
                    <div style="text-align: center; font-size: 8pt;"><strong>Recibido Por</strong></div><br />
                    <span><strong>Nombre:</strong> ___________________________________</span><br /><br />
                    <span><strong>Fecha y hora:</strong> _______________________________</span><br /><br />
                    <span><strong>Firma:</strong> ______________________________________</span>
                </div>
                
                <div style="text-align: center; width: 100%; margin-top: 10px;">
                    <span style="background-color: #f0f0f0; padding: 3px 10px; border-radius: 5px;">
                        P&aacute;gina {{page}} de {{pages}}
                    </span>
                </div>
            </div>`
        };
        
        
        
    

        return footer
   
    }
    

    

}

module.exports = Pdf
