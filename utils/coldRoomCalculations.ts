import { THERMAL_DATA } from '@/constants/thermalData';
import { PRODUCTS, STORAGE_FACTORS } from '@/constants/productData';

interface RoomData {
  length: string;
  width: string;
  height: string;
  doorWidth: string;
  doorHeight: string;
  doorOpenings: string;
  insulationType: string;
  insulationThickness: number;
}

interface ConditionsData {
  externalTemp: string;
  internalTemp: string;
  operatingHours: string;
  pullDownTime: string;
}

interface ProductData {
  productType: string;
  dailyLoad: string;
  incomingTemp: string;
  outgoingTemp: string;
  storageType: string;
  numberOfPeople: string;
  workingHours: string;
  lightingWattage: string;
  equipmentLoad: string;
}

export function calculateColdRoomLoad(
  roomData: RoomData, 
  conditionsData: ConditionsData, 
  productData: ProductData
) {
  // Parse input values with cold room defaults
  const length = parseFloat(roomData.length) || 5.0;
  const width = parseFloat(roomData.width) || 4.0;
  const height = parseFloat(roomData.height) || 3.0;
  const doorWidth = parseFloat(roomData.doorWidth) || 1.2;
  const doorHeight = parseFloat(roomData.doorHeight) || 2.1;
  const doorOpenings = parseFloat(roomData.doorOpenings) || 20;
  const insulationType = roomData.insulationType || 'PUF';
  const insulationThickness = roomData.insulationThickness || 100;
  
  const externalTemp = parseFloat(conditionsData.externalTemp) || 35;
  const internalTemp = parseFloat(conditionsData.internalTemp) || 4;
  const operatingHours = parseFloat(conditionsData.operatingHours) || 24;
  const pullDownTime = parseFloat(conditionsData.pullDownTime) || 6;
  
  const dailyLoad = parseFloat(productData.dailyLoad) || 2000;
  const incomingTemp = parseFloat(productData.incomingTemp) || 25;
  const outgoingTemp = parseFloat(productData.outgoingTemp) || 4;
  const numberOfPeople = parseFloat(productData.numberOfPeople) || 2;
  const workingHours = parseFloat(productData.workingHours) || 6;
  const lightingWattage = parseFloat(productData.lightingWattage) || 200;
  const equipmentLoad = parseFloat(productData.equipmentLoad) || 500;
  
  // Calculate areas and volume
  const wallArea = 2 * (length + width) * height;
  const ceilingArea = length * width;
  const floorArea = length * width;
  const volume = length * width * height;
  const doorArea = doorWidth * doorHeight;
  
  // Temperature difference
  const temperatureDifference = externalTemp - internalTemp;
  
  // Get U-factor from construction data
  const insulationTypeKey = insulationType as keyof typeof THERMAL_DATA.uFactors;
  const thickness = insulationThickness as keyof typeof THERMAL_DATA.uFactors.PUF;
  const uFactor = THERMAL_DATA.uFactors[insulationTypeKey]?.[thickness] || 0.25;
  
  // Get product and storage data
  const product = PRODUCTS[productData.productType as keyof typeof PRODUCTS] || PRODUCTS["General Food Items"];
  const storageFactor = STORAGE_FACTORS[productData.storageType as keyof typeof STORAGE_FACTORS] || STORAGE_FACTORS["Palletized"];
  
  // Calculate storage capacity
  const maxStorageCapacity = volume * product.density * product.storageEfficiency * storageFactor;
  const storageUtilization = (dailyLoad / maxStorageCapacity) * 100;
  
  // 1. Transmission Load Calculations
  const transmissionLoad = {
    walls: (uFactor * wallArea * temperatureDifference) / 1000, // Convert to kW
    ceiling: (uFactor * ceilingArea * temperatureDifference) / 1000,
    floor: (uFactor * floorArea * temperatureDifference) / 1000,
    total: 0
  };
  transmissionLoad.total = transmissionLoad.walls + transmissionLoad.ceiling + transmissionLoad.floor;
  
  // 2. Product Load Calculations (SIMPLIFIED - No Freezing for Cold Room)
  // Only sensible heat calculation since cold room stays above freezing
  const sensibleHeat = (dailyLoad * product.specificHeatAbove * (incomingTemp - outgoingTemp)) / (pullDownTime * 3.6);
  
  const productLoad = {
    sensible: sensibleHeat,
    latent: 0, // No freezing in cold room
    total: sensibleHeat
  };
  
  // 3. Air Infiltration Load (Cold Room Specific Rate)
  const airChangeRate = THERMAL_DATA.airChangeRates.coldRoom;
  const airInfiltrationLoad = (volume * THERMAL_DATA.airDensity * THERMAL_DATA.airSpecificHeat * temperatureDifference * airChangeRate) / 3.6; // Convert to kW
  
  // 4. Internal Loads
  const internalLoads = {
    people: numberOfPeople * THERMAL_DATA.personHeatLoad * (workingHours / 24),
    lighting: (lightingWattage * (operatingHours / 24)) / 1000,
    equipment: equipmentLoad / 1000,
    total: 0
  };
  internalLoads.total = internalLoads.people + internalLoads.lighting + internalLoads.equipment;
  
  // 5. Door Opening Load
  const doorLoad = (doorOpenings * doorArea * 3.0 * Math.sqrt(temperatureDifference)) / 24 / 1000; // Convert to kW
  
  // 6. Total Load Calculation
  const totalLoad = transmissionLoad.total + productLoad.total + airInfiltrationLoad + internalLoads.total + doorLoad;
  
  // 7. Apply Safety Factor
  const totalLoadWithSafety = totalLoad * THERMAL_DATA.safetyFactor;
  
  // 8. Convert to Tons of Refrigeration (1 TR = 3.517 kW)
  const refrigerationTons = totalLoadWithSafety / 3.517;
  
  return {
    dimensions: { length, width, height },
    doorDimensions: { width: doorWidth, height: doorHeight },
    areas: {
      wall: wallArea,
      ceiling: ceilingArea,
      floor: floorArea,
      door: doorArea
    },
    volume,
    storageCapacity: {
      maximum: maxStorageCapacity,
      utilization: storageUtilization,
      storageFactor: storageFactor,
      storageType: productData.storageType
    },
    temperatureDifference,
    pullDownTime,
    construction: {
      type: insulationType,
      thickness: insulationThickness,
      uFactor
    },
    transmissionLoad,
    productInfo: {
      type: productData.productType,
      mass: dailyLoad,
      incomingTemp,
      outgoingTemp,
      properties: product
    },
    productLoad,
    airChangeRate,
    airInfiltrationLoad,
    internalLoads,
    doorLoad,
    doorOpenings,
    workingHours,
    totalLoad,
    totalLoadWithSafety,
    refrigerationTons
  };
}