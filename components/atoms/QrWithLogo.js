import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

export function getFesSnapLogoDataUrl(width = 120, height = 36) {
  // 横長角丸長方形＋中央テキスト
  const rx = height / 2;
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" fill="white"/>
    <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle" font-family="'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif" font-size="${height * 0.7}" font-weight="bold" fill="#2563EB" letter-spacing="1.5">FesSnap</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

export default function QrWithLogo({ value, logoDataUrl, size = 220 }) {
  const ref = useRef();
  useEffect(() => {
    if (!value || !ref.current) return;
    const qrGradient = {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#2563EB' },
        { offset: 1, color: '#60A5FA' }
      ]
    };
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      type: 'svg',
      data: value,
      dotsOptions: {
        gradient: qrGradient,
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: '#fff',
      },
      image: logoDataUrl,
      imageOptions: {
        crossOrigin: 'anonymous',
        imageSize: 0.32,
        margin: 0,
        hideBackgroundDots: true,
      },
      qrOptions: {
        errorCorrectionLevel: 'Q',
      },
    });
    ref.current.innerHTML = '';
    qr.append(ref.current);
  }, [value, logoDataUrl, size]);
  return <div ref={ref} style={{ width: size, height: size }} />;
} 