import { area } from '@turf/area';
import { length } from '@turf/length';


function calculatePropsFromGeo(geo){
  return {
    area: area(geo) / (1_000_000), // (km)^2
    perimeter: length(geo) // km,
  }
}

export {calculatePropsFromGeo}