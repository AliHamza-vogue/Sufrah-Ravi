import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getAssetUrl } from './data/embeddedAssets';

const logoUrl = getAssetUrl('WhatsApp_Image_2026-11-04_at_11.48.52_AM_0c9b2a14.jpeg');
if (logoUrl) {
  let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!iconLink) {
    iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    document.head.appendChild(iconLink);
  }
  iconLink.type = 'image/jpeg';
  iconLink.href = logoUrl;
}

createRoot(document.getElementById('root')!).render(<App />);
