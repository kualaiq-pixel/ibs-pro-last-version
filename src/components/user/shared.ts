// Shared car data constants for the user dashboard

export const CAR_MAKES = [
  'Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Hyundai', 'Nissan',
  'Honda', 'Volvo', 'Kia', 'Peugeot', 'Renault', 'Citroën', 'Skoda', 'Seat', 'Opel',
  'Mazda', 'Mitsubishi', 'Subaru', 'Suzuki', 'Jeep', 'Land Rover', 'Porsche', 'Lexus',
  'Tesla', 'Fiat', 'Alfa Romeo', 'Chevrolet', 'Jaguar', 'Mini', 'Smart', 'Dacia', 'MG',
  'SsangYong', 'Ferrari', 'Lamborghini', 'Maserati', 'Dodge', 'Ram',
];

export const CAR_MODELS: Record<string, string[]> = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Prius', 'Avensis', 'Hilux', 'Land Cruiser', 'GT86', 'CHR', 'Auris', 'Verso'],
  Volkswagen: ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Jetta', 'Arteon', 'T-Roc', 'ID.3', 'ID.4'],
  BMW: ['1 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i3', 'i4'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'EQC', 'CLA', 'GLA'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  Ford: ['Focus', 'Fiesta', 'Kuga', 'Mustang', 'Ranger', 'Transit', 'Puma', 'Bronco', 'Explorer', 'Edge'],
  Hyundai: ['i20', 'i30', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq', 'Elantra', 'Veloster', 'Palisade'],
  Nissan: ['Qashqai', 'Juke', 'Leaf', 'Micra', 'X-Trail', 'Navara', '370Z', 'GT-R'],
  Honda: ['Civic', 'Jazz', 'CR-V', 'HR-V', 'Accord', 'Fit', 'Insight'],
  Volvo: ['XC40', 'XC60', 'XC90', 'V60', 'V90', 'S60', 'S90', 'C40'],
  Kia: ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Niro', 'EV6', 'Picanto', 'Stonic', 'Stinger'],
};

export const ALL_SERVICES = [
  'Battery',
  'Roadside assistance',
  'Maintenance / Service',
  'Air conditioning',
  'Timing belt',
  'Brakes',
  'Suspension and shock absorbers',
  'Vehicle inspection (MOT)',
  'Inspection service',
  'Inspection repairs',
  'Body and damage repair',
  'Clutch',
  'Bearings and axles',
  'Accessories',
  'Engine block heater',
  'Painting work',
  'Engine',
  'Motorcycle service',
  'Other work *',
  'Four-wheel alignment',
  'Steering',
  'Oil change',
  'Tuning and loading',
  'Exhaust system',
  'Bicycle service',
  'Cleaning and care services',
  'Tires',
  'Rust repair',
  'Rust protection',
  'Electrical work',
  'Windshield and windows',
  'Transmission / Gearbox',
  'Lights',
  'Rims',
  'Towbar',
  'Fault diagnosis',
  'Reading fault codes',
];

// API helper
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ibs-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
