import { PincodeServiceability } from '../types/index';
import { calculateDeliveryEstimate } from '../utils/delivery';

interface KnownPincode {
  city: string;
  state: string;
  zone: string;
  days: string;
  cod: boolean;
  express: boolean;
}

// Major hubs and high-density pin codes across India
const PINCODE_MAP: Record<string, KnownPincode> = {
  // Delhi NCR
  '110001': { city: 'New Delhi (Connaught Place)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110019': { city: 'New Delhi (Kalkaji / Nehru Place)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110020': { city: 'New Delhi (Okhla)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110025': { city: 'New Delhi (Jamia / Sukhdev Vihar)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110034': { city: 'New Delhi (Pitampura)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110070': { city: 'New Delhi (Vasant Kunj)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110075': { city: 'New Delhi (Dwarka)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '110092': { city: 'East Delhi (Laxmi Nagar / Anand Vihar)', state: 'Delhi', zone: 'North', days: 'Next Day', cod: true, express: true },
  '122001': { city: 'Gurugram (Cyber City / Old City)', state: 'Haryana', zone: 'North', days: 'Next Day', cod: true, express: true },
  '122002': { city: 'Gurugram (DLF Phase 1-4)', state: 'Haryana', zone: 'North', days: 'Next Day', cod: true, express: true },
  '122018': { city: 'Gurugram (Sohna Road / Sector 48)', state: 'Haryana', zone: 'North', days: 'Next Day', cod: true, express: true },
  '201301': { city: 'Noida (Sector 1 to 20)', state: 'Uttar Pradesh', zone: 'North', days: 'Next Day', cod: true, express: true },
  '201304': { city: 'Noida (Expressway / Sector 93-137)', state: 'Uttar Pradesh', zone: 'North', days: 'Next Day', cod: true, express: true },
  '201010': { city: 'Ghaziabad (Indirapuram / Vaishali)', state: 'Uttar Pradesh', zone: 'North', days: 'Next Day', cod: true, express: true },
  '121001': { city: 'Faridabad (Central)', state: 'Haryana', zone: 'North', days: '1-2 Days', cod: true, express: true },

  // Mumbai & Maharashtra
  '400001': { city: 'Mumbai (Fort / Colaba)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400050': { city: 'Mumbai (Bandra West)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400051': { city: 'Mumbai (BKC / Bandra East)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400053': { city: 'Mumbai (Andheri West)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400072': { city: 'Mumbai (Powai / Saki Naka)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400097': { city: 'Mumbai (Malad East)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400601': { city: 'Thane (West)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '400703': { city: 'Navi Mumbai (Vashi)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '411001': { city: 'Pune (Camp / Station)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '411014': { city: 'Pune (Viman Nagar / Kharadi)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '411057': { city: 'Pune (Hinjawadi IT Park)', state: 'Maharashtra', zone: 'West', days: 'Next Day', cod: true, express: true },
  '440001': { city: 'Nagpur (Central)', state: 'Maharashtra', zone: 'West', days: '2-3 Days', cod: true, express: false },

  // Karnataka & Bengaluru
  '560001': { city: 'Bengaluru (MG Road / Brigade Road)', state: 'Karnataka', zone: 'South', days: 'Next Day', cod: true, express: true },
  '560034': { city: 'Bengaluru (Koramangala)', state: 'Karnataka', zone: 'South', days: 'Next Day', cod: true, express: true },
  '560038': { city: 'Bengaluru (Indiranagar)', state: 'Karnataka', zone: 'South', days: 'Next Day', cod: true, express: true },
  '560066': { city: 'Bengaluru (Whitefield)', state: 'Karnataka', zone: 'South', days: 'Next Day', cod: true, express: true },
  '560100': { city: 'Bengaluru (Electronic City)', state: 'Karnataka', zone: 'South', days: 'Next Day', cod: true, express: true },
  '560102': { city: 'Bengaluru (HSR Layout)', state: 'Karnataka', zone: 'South', days: 'Next Day', cod: true, express: true },
  '570001': { city: 'Mysuru (City)', state: 'Karnataka', zone: 'South', days: '2-3 Days', cod: true, express: true },
  '575001': { city: 'Mangaluru', state: 'Karnataka', zone: 'South', days: '2-3 Days', cod: true, express: true },

  // Telangana & Andhra Pradesh
  '500001': { city: 'Hyderabad (Abids / Koti)', state: 'Telangana', zone: 'South', days: 'Next Day', cod: true, express: true },
  '500034': { city: 'Hyderabad (Banjara Hills)', state: 'Telangana', zone: 'South', days: 'Next Day', cod: true, express: true },
  '500081': { city: 'Hyderabad (HITEC City / Madhapur)', state: 'Telangana', zone: 'South', days: 'Next Day', cod: true, express: true },
  '500032': { city: 'Hyderabad (Gachibowli)', state: 'Telangana', zone: 'South', days: 'Next Day', cod: true, express: true },
  '530001': { city: 'Visakhapatnam (Beach Road)', state: 'Andhra Pradesh', zone: 'South', days: '2-3 Days', cod: true, express: true },
  '520001': { city: 'Vijayawada (City)', state: 'Andhra Pradesh', zone: 'South', days: '2-3 Days', cod: true, express: true },

  // Tamil Nadu & Kerala
  '600001': { city: 'Chennai (George Town)', state: 'Tamil Nadu', zone: 'South', days: 'Next Day', cod: true, express: true },
  '600028': { city: 'Chennai (R.A. Puram / Mylapore)', state: 'Tamil Nadu', zone: 'South', days: 'Next Day', cod: true, express: true },
  '600096': { city: 'Chennai (OMR / Perungudi)', state: 'Tamil Nadu', zone: 'South', days: 'Next Day', cod: true, express: true },
  '641001': { city: 'Coimbatore (City)', state: 'Tamil Nadu', zone: 'South', days: '2-3 Days', cod: true, express: true },
  '682001': { city: 'Kochi / Ernakulam', state: 'Kerala', zone: 'South', days: '2-3 Days', cod: true, express: true },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', zone: 'South', days: '2-3 Days', cod: true, express: true },

  // West Bengal & East
  '700001': { city: 'Kolkata (BBD Bagh / Central)', state: 'West Bengal', zone: 'East', days: 'Next Day', cod: true, express: true },
  '700091': { city: 'Kolkata (Salt Lake Sector V)', state: 'West Bengal', zone: 'East', days: 'Next Day', cod: true, express: true },
  '700156': { city: 'Kolkata (New Town / Rajarhat)', state: 'West Bengal', zone: 'East', days: 'Next Day', cod: true, express: true },
  '751001': { city: 'Bhubaneswar', state: 'Odisha', zone: 'East', days: '2-3 Days', cod: true, express: true },
  '781001': { city: 'Guwahati', state: 'Assam', zone: 'East', days: '3-4 Days', cod: true, express: false },
  '800001': { city: 'Patna (Central)', state: 'Bihar', zone: 'East', days: '2-3 Days', cod: true, express: true },

  // Gujarat & Rajasthan
  '380001': { city: 'Ahmedabad (Old City)', state: 'Gujarat', zone: 'West', days: '1-2 Days', cod: true, express: true },
  '380015': { city: 'Ahmedabad (Satellite / SG Highway)', state: 'Gujarat', zone: 'West', days: '1-2 Days', cod: true, express: true },
  '395001': { city: 'Surat (Central)', state: 'Gujarat', zone: 'West', days: '1-2 Days', cod: true, express: true },
  '390001': { city: 'Vadodara', state: 'Gujarat', zone: 'West', days: '1-2 Days', cod: true, express: true },
  '302001': { city: 'Jaipur (C-Scheme / MI Road)', state: 'Rajasthan', zone: 'North', days: '1-2 Days', cod: true, express: true },
  '302017': { city: 'Jaipur (Malviya Nagar)', state: 'Rajasthan', zone: 'North', days: '1-2 Days', cod: true, express: true },
  '342001': { city: 'Jodhpur', state: 'Rajasthan', zone: 'North', days: '2-3 Days', cod: true, express: true },

  // Madhya Pradesh, Punjab, UP & Others
  '452001': { city: 'Indore (MG Road)', state: 'Madhya Pradesh', zone: 'Central', days: '2-3 Days', cod: true, express: true },
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh', zone: 'Central', days: '2-3 Days', cod: true, express: true },
  '160017': { city: 'Chandigarh (Sector 17)', state: 'Chandigarh', zone: 'North', days: 'Next Day', cod: true, express: true },
  '141001': { city: 'Ludhiana', state: 'Punjab', zone: 'North', days: '1-2 Days', cod: true, express: true },
  '143001': { city: 'Amritsar', state: 'Punjab', zone: 'North', days: '1-2 Days', cod: true, express: true },
  '226001': { city: 'Lucknow (Hazratganj)', state: 'Uttar Pradesh', zone: 'North', days: '1-2 Days', cod: true, express: true },
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh', zone: 'North', days: '2-3 Days', cod: true, express: true },
  '221001': { city: 'Varanasi', state: 'Uttar Pradesh', zone: 'North', days: '2-3 Days', cod: true, express: true },
  '248001': { city: 'Dehradun', state: 'Uttarakhand', zone: 'North', days: '2-3 Days', cod: true, express: true },
  '171001': { city: 'Shimla', state: 'Himachal Pradesh', zone: 'North', days: '3-4 Days', cod: true, express: false },
};

// State mapping for first 2 digits of PIN code
const PINCODE_PREFIX_STATE_MAP: Record<string, { state: string; zone: string; defaultCity: string }> = {
  '11': { state: 'Delhi', zone: 'North', defaultCity: 'New Delhi' },
  '12': { state: 'Haryana', zone: 'North', defaultCity: 'Gurugram / Faridabad' },
  '13': { state: 'Haryana', zone: 'North', defaultCity: 'Ambala / Panipat' },
  '14': { state: 'Punjab', zone: 'North', defaultCity: 'Ludhiana / Jalandhar' },
  '15': { state: 'Punjab', zone: 'North', defaultCity: 'Bathinda / Firozpur' },
  '16': { state: 'Chandigarh / Punjab', zone: 'North', defaultCity: 'Chandigarh / Mohali' },
  '17': { state: 'Himachal Pradesh', zone: 'North', defaultCity: 'Shimla / Solan' },
  '18': { state: 'Jammu & Kashmir', zone: 'North', defaultCity: 'Jammu' },
  '19': { state: 'Jammu & Kashmir', zone: 'North', defaultCity: 'Srinagar' },
  '20': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Noida / Ghaziabad / Aligarh' },
  '21': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Prayagraj / Fatehpur' },
  '22': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Lucknow / Barabanki' },
  '23': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Mirzapur / Sonbhadra' },
  '24': { state: 'Uttar Pradesh / Uttarakhand', zone: 'North', defaultCity: 'Dehradun / Bareilly' },
  '25': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Meerut / Muzaffarnagar' },
  '26': { state: 'Uttarakhand / UP', zone: 'North', defaultCity: 'Haldwani / Nainital' },
  '27': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Gorakhpur / Basti' },
  '28': { state: 'Uttar Pradesh', zone: 'North', defaultCity: 'Agra / Mathura' },
  '30': { state: 'Rajasthan', zone: 'North', defaultCity: 'Jaipur' },
  '31': { state: 'Rajasthan', zone: 'North', defaultCity: 'Udaipur / Kota' },
  '32': { state: 'Rajasthan', zone: 'North', defaultCity: 'Ajmer / Alwar' },
  '33': { state: 'Rajasthan', zone: 'North', defaultCity: 'Bikaner' },
  '34': { state: 'Rajasthan', zone: 'North', defaultCity: 'Jodhpur' },
  '36': { state: 'Gujarat', zone: 'West', defaultCity: 'Rajkot' },
  '37': { state: 'Gujarat', zone: 'West', defaultCity: 'Kutch / Gandhidham' },
  '38': { state: 'Gujarat', zone: 'West', defaultCity: 'Ahmedabad / Gandhinagar' },
  '39': { state: 'Gujarat', zone: 'West', defaultCity: 'Surat / Vadodara' },
  '40': { state: 'Maharashtra / Goa', zone: 'West', defaultCity: 'Mumbai / Panaji' },
  '41': { state: 'Maharashtra', zone: 'West', defaultCity: 'Pune / Nashik / Solapur' },
  '42': { state: 'Maharashtra', zone: 'West', defaultCity: 'Dhule / Jalgaon' },
  '43': { state: 'Maharashtra', zone: 'West', defaultCity: 'Aurangabad / Nanded' },
  '44': { state: 'Maharashtra', zone: 'West', defaultCity: 'Nagpur / Amravati' },
  '45': { state: 'Madhya Pradesh', zone: 'Central', defaultCity: 'Indore / Ujjain' },
  '46': { state: 'Madhya Pradesh', zone: 'Central', defaultCity: 'Bhopal' },
  '47': { state: 'Madhya Pradesh', zone: 'Central', defaultCity: 'Gwalior' },
  '48': { state: 'Madhya Pradesh', zone: 'Central', defaultCity: 'Jabalpur' },
  '49': { state: 'Chhattisgarh', zone: 'Central', defaultCity: 'Raipur / Bilaspur' },
  '50': { state: 'Telangana', zone: 'South', defaultCity: 'Hyderabad / Secunderabad' },
  '51': { state: 'Andhra Pradesh', zone: 'South', defaultCity: 'Tirupati / Kurnool' },
  '52': { state: 'Andhra Pradesh', zone: 'South', defaultCity: 'Vijayawada / Guntur' },
  '53': { state: 'Andhra Pradesh', zone: 'South', defaultCity: 'Visakhapatnam' },
  '56': { state: 'Karnataka', zone: 'South', defaultCity: 'Bengaluru' },
  '57': { state: 'Karnataka', zone: 'South', defaultCity: 'Mysuru / Mangaluru' },
  '58': { state: 'Karnataka', zone: 'South', defaultCity: 'Hubballi / Belagavi' },
  '59': { state: 'Karnataka', zone: 'South', defaultCity: 'Kalaburagi' },
  '60': { state: 'Tamil Nadu', zone: 'South', defaultCity: 'Chennai' },
  '61': { state: 'Tamil Nadu', zone: 'South', defaultCity: 'Tiruchirappalli' },
  '62': { state: 'Tamil Nadu', zone: 'South', defaultCity: 'Madurai' },
  '63': { state: 'Tamil Nadu', zone: 'South', defaultCity: 'Salem / Vellore' },
  '64': { state: 'Tamil Nadu', zone: 'South', defaultCity: 'Coimbatore' },
  '67': { state: 'Kerala', zone: 'South', defaultCity: 'Kozhikode / Malappuram' },
  '68': { state: 'Kerala', zone: 'South', defaultCity: 'Kochi / Thrissur' },
  '69': { state: 'Kerala', zone: 'South', defaultCity: 'Thiruvananthapuram' },
  '70': { state: 'West Bengal', zone: 'East', defaultCity: 'Kolkata' },
  '71': { state: 'West Bengal', zone: 'East', defaultCity: 'Howrah / Asansol' },
  '72': { state: 'West Bengal', zone: 'East', defaultCity: 'Medinipur' },
  '73': { state: 'West Bengal / Sikkim', zone: 'East', defaultCity: 'Siliguri / Gangtok' },
  '74': { state: 'West Bengal', zone: 'East', defaultCity: 'North 24 Parganas' },
  '75': { state: 'Odisha', zone: 'East', defaultCity: 'Bhubaneswar / Cuttack' },
  '76': { state: 'Odisha', zone: 'East', defaultCity: 'Rourkela / Berhampur' },
  '77': { state: 'Odisha', zone: 'East', defaultCity: 'Sambalpur' },
  '78': { state: 'Assam', zone: 'East', defaultCity: 'Guwahati' },
  '79': { state: 'North East (Meghalaya, Tripura, Mizoram, Nagaland, Manipur, Arunachal)', zone: 'East', defaultCity: 'Shillong / Agartala' },
  '80': { state: 'Bihar', zone: 'East', defaultCity: 'Patna' },
  '81': { state: 'Bihar / Jharkhand', zone: 'East', defaultCity: 'Bhagalpur / Deoghar' },
  '82': { state: 'Jharkhand', zone: 'East', defaultCity: 'Dhanbad / Bokaro' },
  '83': { state: 'Jharkhand', zone: 'East', defaultCity: 'Ranchi / Jamshedpur' },
  '84': { state: 'Bihar', zone: 'East', defaultCity: 'Muzaffarpur' },
  '85': { state: 'Bihar', zone: 'East', defaultCity: 'Purnea / Saharsa' },
};

/**
 * Instantaneous Pincode Verification Function
 * Checks 6-digit Indian PIN code against postal grid and serviceable database.
 */
export function verifyIndianPincode(pincode: string): PincodeServiceability {
  const cleanPin = (pincode || '').trim();

  // Validate format: Must be exactly 6 digits, cannot start with 0
  if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      serviceable: false,
      city: '',
      state: '',
      zone: '',
      deliveryDays: '',
      codAvailable: false,
      expressDelivery: false,
      message: 'Please enter a valid 6-digit Indian pincode.',
    };
  }

  // Exact map match
  if (PINCODE_MAP[cleanPin]) {
    const item = PINCODE_MAP[cleanPin];
    const isExpress = item.express || item.days.toLowerCase().includes('next');
    const estimate = calculateDeliveryEstimate(isExpress);
    return {
      pincode: cleanPin,
      serviceable: true,
      city: item.city,
      state: item.state,
      zone: item.zone,
      deliveryDays: item.days,
      estimatedDeliveryDate: estimate.estimatedDate,
      codAvailable: item.cod,
      expressDelivery: item.express,
      message: `Delivery is available at pincode ${cleanPin}`,
    };
  }

  // Prefix match based on Indian postal regions
  const prefix2 = cleanPin.substring(0, 2);
  const region = PINCODE_PREFIX_STATE_MAP[prefix2];

  if (region) {
    const isMetroZone = ['Delhi', 'Maharashtra', 'Karnataka', 'Telangana', 'Tamil Nadu'].includes(region.state);
    const estimate = calculateDeliveryEstimate(isMetroZone);
    return {
      pincode: cleanPin,
      serviceable: true,
      city: region.defaultCity,
      state: region.state,
      zone: region.zone,
      deliveryDays: isMetroZone ? '1-2 Days' : '2-4 Days',
      estimatedDeliveryDate: estimate.estimatedDate,
      codAvailable: true,
      expressDelivery: isMetroZone,
      message: `Delivery is available at pincode ${cleanPin}`,
    };
  }

  // Unserviceable pincode
  return {
    pincode: cleanPin,
    serviceable: false,
    city: '',
    state: '',
    zone: '',
    deliveryDays: '',
    codAvailable: false,
    expressDelivery: false,
    message: 'This pincode is currently not serviceable for express delivery.',
  };
}
