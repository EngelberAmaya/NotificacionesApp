import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

	mensajes: OSNotificationPayload[] = [
     /*{
       title: 'Titulo de la push',
       body: 'Este es el body de la push',
       date: new Date()
     }*/
    ];

    pushListener = new EventEmitter<OSNotificationPayload>();
    userId: string

  constructor(private oneSignal: OneSignal, private storage: Storage) {

  	this.cargarMensajes();
  }


  async getMensajes(){
  	await this.cargarMensajes();
  	return [...this.mensajes];
  }

  configuracionInicial(){
  	// Onesignal App Id e Id del remitente, en la configuraciones del proyecto en firebase,
    //registrarse en ambas herramientas y generar sus Id respectivos y sustituirlos en la linea 35
  	this.oneSignal.startInit('tu_Onesignal_App_id', 'tu_Id_remitente');

	this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

	this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
	 // do something when notification is received
	 console.log('Notificación recibida', noti );
	 this.notificacionRecibida(noti);
	});

	this.oneSignal.handleNotificationOpened().subscribe( async( noti ) => {
	  // do something when a notification is opened
	  console.log('Notificación abierta', noti );
	  await this.notificacionRecibida( noti.notification );
	});

	//Obtener ID del suscritor
	this.oneSignal.getIds().then( info => {
		this.userId = info.userId;
		console.log(this.userId);
	});

	this.oneSignal.endInit();
  }


  async notificacionRecibida(noti: OSNotification){

  	await this.cargarMensajes();

  	const payload = noti.payload;

  	const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID);

 	if (existePush) {
 		return;
 	}

 	this.mensajes.unshift( payload );
 	this.pushListener.emit(payload);
 	await this.guardarMensaje();

  }


  guardarMensaje(){
  	this.storage.set('mensajes', this.mensajes);
  }


  async cargarMensajes(){
  	this.mensajes = await this.storage.get('mensaje') || [];
  	return this.mensajes;
  }


  async borrarMensajes(){
  	await this.storage.clear();
  	this.mensajes = [];
  	this.guardarMensaje();
  }

}
