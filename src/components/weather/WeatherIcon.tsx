import React, { JSX } from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  CloudFog,
} from "lucide-react";

interface WeatherIconProps {
  icon: string;
  size?: number;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, size = 62 }) => {
  const iconMapping: Record<string, JSX.Element> = {
    "01d": <Sun size={size} color="#FFD700" />, // Zon
    "01n": <Moon size={size} color="#AAB7B8" />, // Maan
    "02d": <Cloud size={size} color="#B0C4DE" />, // Licht bewolkt
    "02n": <Cloud size={size} color="#AAB7B8" />,
    "03d": <Cloud size={size} color="#A9A9A9" />, // Bewolkt
    "03n": <Cloud size={size} color="#A9A9A9" />,
    "04d": <Cloud size={size} color="#808B96" />, // Zwaar bewolkt
    "04n": <Cloud size={size} color="#808B96" />,
    "09d": <CloudRain size={size} color="#4682B4" />, // Regen
    "09n": <CloudRain size={size} color="#4682B4" />,
    "10d": <CloudRain size={size} color="#1E90FF" />,
    "10n": <CloudRain size={size} color="#1E90FF" />,
    "11d": <CloudLightning size={size} color="#FFD700" />, // Onweer
    "11n": <CloudLightning size={size} color="#FFD700" />,
    "13d": <CloudSnow size={size} color="#B0E0E6" />, // Sneeuw
    "13n": <CloudSnow size={size} color="#B0E0E6" />,
    "50d": <CloudFog size={size} color="#778899" />, // Mist
    "50n": <CloudFog size={size} color="#778899" />,
  };

  return iconMapping[icon] || <Wind size={size} color="#D3D3D3" />; // Wind als fallback
};

export default WeatherIcon;
