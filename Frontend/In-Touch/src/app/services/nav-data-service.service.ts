import { Injectable } from '@angular/core';
//import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NavDataServiceService {

  private data = [];
  private dataWithoutId : any;


  constructor() {
    console.log("============= INIT NAVDATA SERVICE ===========")
  }
 
  setDataWithoutId(data: any){
    this.dataWithoutId = data;
  }

  getDataWithoutId(){
    console.log("GET DATA ")
    console.log(this.dataWithoutId)
    return this.dataWithoutId;
  }

  setData(id: string, data: string) {
    console.error("ERRRROR")
    //this.data[id] = data;
  //  console.log("SET DATA "+JSON.stringify(data))
  }
 
  getData(id: any) {
  
    return this.data[id];
  }

  resetData(){
    this.data=[]
    this.dataWithoutId=[]
  }
}