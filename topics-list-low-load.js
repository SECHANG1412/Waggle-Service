  import http from "k6/http";
  import { check, sleep } from "k6";                                                                                                                                 
                                                                                                                                                                     
  export const options = {                                                                                                                                           
    vus: 5,                                                                                                                                                          
    duration: "30s",                                                                                                                                                 
  };                                                                                                                                                                 
                                                                                                                                                                     
  export default function () {                                                                                                                                       
    const res = http.get("http://host.docker.internal:8000/topics?limit=10&offset=0");                                                                               
    check(res, {                                                                                                                                                     
      "status is 200": (r) => r.status === 200,
    });                                                                                                                                                              
    sleep(1);                                                                                                                                                        
  }  
