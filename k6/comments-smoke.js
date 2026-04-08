import http from "k6/http";                                                                         
  import { check, sleep } from "k6";                                                                  

  export const options = {                                                                            
    vus: 1,                                                                                           
    duration: "10s",                                                                                  
  };                                                                                                  

  export default function () {                                                                        
    const res = http.get("http://host.docker.internal:8000/comments/by-topic/28");                    
    check(res, {                                                                                      
      "status is 200": (r) => r.status === 200,                                                       
    });                                                                                               
    sleep(1);                                                                                         
  } 
