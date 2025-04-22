import { DOMAINS } from "@/lib/constants";

interface DomainSliderProps {
  domain: string;
  label: string;
  value: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export default function DomainSlider({ 
  domain, 
  label, 
  value, 
  readOnly = false,
  onChange 
}: DomainSliderProps) {
  // Find domain color
  const domainInfo = DOMAINS.find(d => d.id === domain);
  const bgColor = domainInfo?.bgClass || 'bg-gray-500';
  
  // Handle slider change if not read-only
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly && onChange) {
      onChange(parseInt(e.target.value));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500">{value}/10</span>
      </div>
      <div className="relative">
        {readOnly ? (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${bgColor} h-2 rounded-full`} 
              style={{width: `${value * 10}%`}}
            ></div>
          </div>
        ) : (
          <input
            type="range"
            min="0"
            max="10"
            value={value}
            onChange={handleChange}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              readOnly ? 'opacity-60 cursor-default' : ''
            }`}
            style={{
              background: `linear-gradient(to right, ${domainInfo?.color || '#4F46E5'} 0%, ${domainInfo?.color || '#4F46E5'} ${value * 10}%, #E5E7EB ${value * 10}%, #E5E7EB 100%)`,
            }}
            disabled={readOnly}
          />
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Not Confident</span>
        <span>Very Confident</span>
      </div>
    </div>
  );
}
