import { GameAccount } from '../types';

export const OFFICIAL_WA_NUMBER = '6285717046895';
export const DISPLAY_WA_NUMBER = '085717046895';

/**
 * Format number with dots as thousand separator for Indonesian locale.
 * e.g., 2000 -> "2.000", 180000 -> "180.000", 1000000 -> "1.000.000"
 */
export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(amount);
}

/**
 * Format currency to Rupiah string: "Rp 350.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${formatNumber(amount)}`;
}

/**
 * Parse string with dots or non-digits into a clean integer number
 */
export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

/**
 * Template WhatsApp untuk Pembeli Langsung (Harga Pas):
 * "Halo Gan, saya tertarik dengan akun [Judul Lapak] (ID Lapak: [ID_AKUN]) seharga Rp [Harga]. Apakah stok akun ini masih ready?"
 */
export function buildBuyWaLink(account: GameAccount): string {
  const formattedPrice = formatNumber(account.price);
  const accountIdDisplay = account.idLapak || account.accountId || account.id;
  const message = `Halo Gan, saya tertarik dengan akun ${account.title} (ID Lapak: ${accountIdDisplay}) seharga Rp ${formattedPrice}. Apakah stok akun ini masih ready?`;
  return `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Template WhatsApp untuk Nego:
 * "Halo Gan, saya mau nego untuk akun [Judul Lapak] (ID Lapak: [ID_AKUN]). Harga buka Rp [Harga], saya tawar di angka Rp [Harga_Tawaran]. Apakah stok masih ada dan harga cocok?"
 */
export function buildNegoWaLink(account: GameAccount, offerPrice: number): string {
  const formattedPrice = formatNumber(account.price);
  const formattedOffer = formatNumber(offerPrice);
  const accountIdDisplay = account.idLapak || account.accountId || account.id;
  const message = `Halo Gan, saya mau nego untuk akun ${account.title} (ID Lapak: ${accountIdDisplay}). Harga buka Rp ${formattedPrice}, saya tawar di angka Rp ${formattedOffer}. Apakah stok masih ada dan harga cocok?`;
  return `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Validate Nego: minimum 70% of opening price
 */
export function validateNegoOffer(originalPrice: number, offerPrice: number): {
  valid: boolean;
  minOffer: number;
  message?: string;
} {
  const minOffer = Math.round(originalPrice * 0.7); // 70% threshold
  if (!offerPrice || offerPrice <= 0) {
    return {
      valid: false,
      minOffer,
      message: 'Silakan masukkan nominal penawaran harga.',
    };
  }
  if (offerPrice >= originalPrice) {
    return {
      valid: true,
      minOffer,
      message: 'Harga penawaran sama atau lebih tinggi dari harga buka.',
    };
  }
  if (offerPrice < minOffer) {
    return {
      valid: false,
      minOffer,
      message: `Penawaran terlalu rendah. Minimal penawaran yang diizinkan adalah Rp ${formatNumber(minOffer)} (70% dari harga buka).`,
    };
  }
  return {
    valid: true,
    minOffer,
  };
}
