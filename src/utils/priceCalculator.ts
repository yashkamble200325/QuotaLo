import { Car, PriceBreakdown } from '../types';

export const calculatePriceBreakdown = (car: Car): PriceBreakdown => {
  const base = car.baseExShowroomPrice || 0;
  const rto = car.rtoCharges || 0;
  const insurance = car.insuranceAmount || 0;
  const fastag = car.fastagCharges || 500;
  const handling = car.handlingCharges || 5000;
  const accessories = car.accessoriesPackage || 0;
  const warranty = car.extendedWarranty || 0;

  const subtotal = base + rto + insurance + fastag + handling + accessories + warranty;

  const discount = car.discountOffer || 0;
  const exchange = car.exchangeBonus || 0;
  const corporate = car.corporateDiscount || 0;

  const totalDiscount = discount + exchange + corporate;
  const finalOnRoadPrice = subtotal - totalDiscount;

  return {
    baseExShowroomPrice: base,
    rtoCharges: rto,
    insuranceAmount: insurance,
    fastagCharges: fastag,
    handlingCharges: handling,
    accessoriesPackage: accessories,
    extendedWarranty: warranty,
    subtotal,
    discountOffer: discount,
    exchangeBonus: exchange,
    corporateDiscount: corporate,
    totalDiscount,
    finalOnRoadPrice
  };
};

export const calculateEMI = (principal: number, interestRate: number = 8.5, tenureYears: number = 5): number => {
  const monthlyRate = interestRate / 12 / 100;
  const months = tenureYears * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
};
