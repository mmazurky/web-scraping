 import { getEnvProperty } from "./properties-utilities.js";
 import { INVALID_TOKEN } from "../constants/webscraper-constants.js";
 import { WEBSCRAPER_TOKEN } from "../constants/env-constants.js";


 class WebscraperUtilities {
     /**
      * Validates if the webscraper token exists as environment variable
      * @returns 
      */
     static validateWebscraperToken() {
         if (getEnvProperty(WEBSCRAPER_TOKEN) === "") {
             throw new Error(INVALID_TOKEN);
         }

         return true;
     }
 }

 export {
     WebscraperUtilities
 }