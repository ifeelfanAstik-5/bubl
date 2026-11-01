import React from 'react';
import { AvatarConfig } from '../types';

interface Avatar2DProps {
  config: AvatarConfig;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

const SIZE_MAP = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
  '2xl': 'w-36 h-36'
};

export const Avatar2D: React.FC<Avatar2DProps> = ({
  config,
  size = 'md',
  className = '',
  showBorder = true
}) => {
  const {
    skinColor = '#F5D0C5',
    hairStyle = 'wavy',
    hairColor = '#3A2E2B',
    eyeStyle = 'calm',
    mouthStyle = 'subtle_smile',
    glassesStyle = 'none',
    clothingStyle = 'sweater',
    clothingColor = '#7A8B7B',
    bgTint = '#E8EFE9'
  } = config;

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center select-none ${
        SIZE_MAP[size]
      } ${showBorder ? 'ring-1 ring-black/5 shadow-xs' : ''} ${className}`}
      style={{ backgroundColor: bgTint }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft atmospheric background glow */}
        <circle cx="60" cy="60" r="58" fill={bgTint} />

        {/* Clothing / Torso & Shoulders */}
        <g id="clothing">
          {clothingStyle === 'sweater' && (
            <>
              <path
                d="M22 120 C22 92 38 82 60 82 C82 82 98 92 98 120 Z"
                fill={clothingColor}
              />
              {/* Ribbed crew neck collar */}
              <path
                d="M48 84 C52 90 68 90 72 84 C76 84 80 88 80 92 C72 96 48 96 40 92 C40 88 44 84 48 84 Z"
                fill="black"
                fillOpacity="0.12"
              />
            </>
          )}

          {clothingStyle === 'turtleneck' && (
            <>
              <path
                d="M20 120 C20 90 38 80 60 80 C82 80 100 90 100 120 Z"
                fill={clothingColor}
              />
              <rect
                x="47"
                y="68"
                width="26"
                height="18"
                rx="4"
                fill={clothingColor}
              />
              <path
                d="M47 74 L73 74"
                stroke="black"
                strokeOpacity="0.12"
                strokeWidth="1.5"
              />
            </>
          )}

          {clothingStyle === 'hoodie' && (
            <>
              <path
                d="M20 120 C20 90 36 84 60 84 C84 84 100 90 100 120 Z"
                fill={clothingColor}
              />
              {/* Hood curve around neck */}
              <path
                d="M42 80 C48 94 72 94 78 80 C84 82 88 88 84 96 C72 102 48 102 36 96 C32 88 36 82 42 80 Z"
                fill="black"
                fillOpacity="0.15"
              />
              {/* Drawstrings */}
              <path
                d="M52 94 L52 106 M68 94 L68 106"
                stroke="#FAF7F2"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </>
          )}

          {clothingStyle === 'cardigan' && (
            <>
              <path
                d="M22 120 C22 92 38 82 60 82 C82 82 98 92 98 120 Z"
                fill={clothingColor}
              />
              {/* Inner tee shirt */}
              <polygon points="52,82 68,82 60,102" fill="#FAF8F5" />
              {/* Cardigan V-neck lapel lines */}
              <path
                d="M48 82 L60 104 L60 120 M72 82 L60 104"
                stroke="black"
                strokeOpacity="0.16"
                strokeWidth="2"
              />
              {/* Buttons */}
              <circle cx="60" cy="110" r="1.5" fill="#3A342D" />
              <circle cx="60" cy="116" r="1.5" fill="#3A342D" />
            </>
          )}

          {clothingStyle === 'buttondown' && (
            <>
              <path
                d="M22 120 C22 92 38 82 60 82 C82 82 98 92 98 120 Z"
                fill={clothingColor}
              />
              {/* Crisp collar points */}
              <path
                d="M48 80 L60 92 L53 96 Z"
                fill="#FAF8F5"
                stroke="black"
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
              <path
                d="M72 80 L60 92 L67 96 Z"
                fill="#FAF8F5"
                stroke="black"
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
              <line
                x1="60"
                y1="92"
                x2="60"
                y2="120"
                stroke="black"
                strokeOpacity="0.15"
                strokeWidth="1.5"
              />
            </>
          )}
        </g>

        {/* Neck */}
        <rect
          x="51"
          y="62"
          width="18"
          height="22"
          rx="5"
          fill={skinColor}
        />
        {/* Subtle neck shadow under chin */}
        <path
          d="M51 68 C56 72 64 72 69 68 C69 72 51 72 51 68 Z"
          fill="black"
          fillOpacity="0.08"
        />

        {/* Ears */}
        <ellipse cx="36" cy="52" rx="4.5" ry="6.5" fill={skinColor} />
        <ellipse cx="84" cy="52" rx="4.5" ry="6.5" fill={skinColor} />

        {/* Head / Face Base */}
        <path
          d="M38 46 C38 29 48 20 60 20 C72 20 82 29 82 46 C82 62 73 70 60 70 C47 70 38 62 38 46 Z"
          fill={skinColor}
        />

        {/* Soft Cheek Blush */}
        <circle cx="45" cy="54" r="4.5" fill="#E88D82" fillOpacity="0.32" />
        <circle cx="75" cy="54" r="4.5" fill="#E88D82" fillOpacity="0.32" />

        {/* Eyebrows */}
        <path
          d="M46 41 C49 39.5 53 40 55 42"
          stroke={hairColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M74 41 C71 39.5 67 40 65 42"
          stroke={hairColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Eyes */}
        <g id="eyes">
          {eyeStyle === 'calm' && (
            <>
              <circle cx="50" cy="47" r="2.8" fill="#2C2724" />
              <circle cx="51" cy="46" r="0.9" fill="#FFFFFF" />
              <circle cx="70" cy="47" r="2.8" fill="#2C2724" />
              <circle cx="71" cy="46" r="0.9" fill="#FFFFFF" />
            </>
          )}

          {eyeStyle === 'gentle' && (
            <>
              <path
                d="M46 48 C48 45 52 45 54 48"
                stroke="#2C2724"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M66 48 C68 45 72 45 74 48"
                stroke="#2C2724"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </>
          )}

          {eyeStyle === 'smiling' && (
            <>
              {/* Curved smiling crescent eyes */}
              <path
                d="M46 47 C48 44 52 44 54 47"
                stroke="#2C2724"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M66 47 C68 44 72 44 74 47"
                stroke="#2C2724"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </>
          )}

          {eyeStyle === 'curious' && (
            <>
              <ellipse cx="50" cy="47" rx="3.2" ry="3.8" fill="#2C2724" />
              <circle cx="51" cy="45.5" r="1.2" fill="#FFFFFF" />
              <ellipse cx="70" cy="47" rx="3.2" ry="3.8" fill="#2C2724" />
              <circle cx="71" cy="45.5" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {eyeStyle === 'winking' && (
            <>
              <path
                d="M46 47 C48 45 52 45 54 47"
                stroke="#2C2724"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="70" cy="47" r="2.8" fill="#2C2724" />
              <circle cx="71" cy="46" r="0.9" fill="#FFFFFF" />
            </>
          )}
        </g>

        {/* Minimalist Nose */}
        <path
          d="M59 50 C60 52 61 53 62 53"
          stroke="#443E38"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Mouth */}
        <g id="mouth">
          {mouthStyle === 'subtle_smile' && (
            <path
              d="M56 59 C58 61 62 61 64 59"
              stroke="#3A322C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {mouthStyle === 'warm_grin' && (
            <path
              d="M55 58 C57 63 63 63 65 58 Z"
              fill="#D97757"
              stroke="#3A322C"
              strokeWidth="1.5"
            />
          )}

          {mouthStyle === 'calm' && (
            <line
              x1="57"
              y1="60"
              x2="63"
              y2="60"
              stroke="#3A322C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {mouthStyle === 'thoughtful' && (
            <path
              d="M56 60 C58 60 61 58.5 63 59"
              stroke="#3A322C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* Glasses (if enabled) */}
        {glassesStyle !== 'none' && (
          <g id="glasses">
            {glassesStyle === 'round' && (
              <>
                <circle
                  cx="49"
                  cy="47"
                  r="7.5"
                  stroke="#38302A"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="71"
                  cy="47"
                  r="7.5"
                  stroke="#38302A"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="56.5"
                  y1="47"
                  x2="63.5"
                  y2="47"
                  stroke="#38302A"
                  strokeWidth="2"
                />
                <line
                  x1="41.5"
                  y1="47"
                  x2="36"
                  y2="48"
                  stroke="#38302A"
                  strokeWidth="1.5"
                />
                <line
                  x1="78.5"
                  y1="47"
                  x2="84"
                  y2="48"
                  stroke="#38302A"
                  strokeWidth="1.5"
                />
              </>
            )}

            {glassesStyle === 'wire' && (
              <>
                <circle
                  cx="49"
                  cy="47"
                  r="7.5"
                  stroke="#B58348"
                  strokeWidth="1.2"
                  fill="none"
                />
                <circle
                  cx="71"
                  cy="47"
                  r="7.5"
                  stroke="#B58348"
                  strokeWidth="1.2"
                  fill="none"
                />
                <line
                  x1="56.5"
                  y1="46"
                  x2="63.5"
                  y2="46"
                  stroke="#B58348"
                  strokeWidth="1.2"
                />
              </>
            )}

            {glassesStyle === 'square' && (
              <>
                <rect
                  x="42"
                  y="40"
                  width="14"
                  height="13"
                  rx="3"
                  stroke="#2F2B28"
                  strokeWidth="2"
                  fill="none"
                />
                <rect
                  x="64"
                  y="40"
                  width="14"
                  height="13"
                  rx="3"
                  stroke="#2F2B28"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="56"
                  y1="45"
                  x2="64"
                  y2="45"
                  stroke="#2F2B28"
                  strokeWidth="2"
                />
              </>
            )}
          </g>
        )}

        {/* Hair Styles */}
        <g id="hair">
          {hairStyle === 'wavy' && (
            <path
              d="M34 46 C34 26 44 16 60 16 C76 16 86 26 86 46 C86 52 84 56 84 62 C80 50 82 32 72 26 C62 20 48 24 44 34 C40 40 42 56 36 62 C34 54 34 50 34 46 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'curly' && (
            <g fill={hairColor}>
              <circle cx="42" cy="28" r="9" />
              <circle cx="54" cy="21" r="9" />
              <circle cx="66" cy="21" r="9" />
              <circle cx="78" cy="28" r="9" />
              <circle cx="34" cy="38" r="8" />
              <circle cx="86" cy="38" r="8" />
              <circle cx="36" cy="50" r="7" />
              <circle cx="84" cy="50" r="7" />
              <path d="M42 26 C50 18 70 18 78 26 C72 32 48 32 42 26 Z" />
            </g>
          )}

          {hairStyle === 'classic' && (
            <path
              d="M35 44 C35 25 45 18 60 18 C75 18 85 25 85 44 C81 35 76 28 64 26 C48 24 38 34 35 44 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'bob' && (
            <path
              d="M34 48 C34 25 44 16 60 16 C76 16 86 25 86 48 C86 64 82 66 80 66 C80 50 82 30 70 25 C60 21 46 25 42 32 C38 42 40 66 34 66 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'bun' && (
            <>
              {/* Top Bun */}
              <ellipse cx="60" cy="12" rx="11" ry="8" fill={hairColor} />
              {/* Sleek Base */}
              <path
                d="M36 44 C36 26 46 19 60 19 C74 19 84 26 84 44 C80 34 76 28 60 28 C44 28 40 34 36 44 Z"
                fill={hairColor}
              />
            </>
          )}

          {hairStyle === 'short' && (
            <path
              d="M35 40 C35 25 45 18 60 18 C75 18 85 25 85 40 C80 33 70 26 58 26 C46 26 39 32 35 40 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'buzz' && (
            <path
              d="M37 40 C37 25 46 21 60 21 C74 21 83 25 83 40 C80 32 72 26 60 26 C48 26 40 32 37 40 Z"
              fill={hairColor}
              opacity="0.85"
            />
          )}

          {hairStyle === 'ponytail' && (
            <>
              {/* Ponytail tuft */}
              <path
                d="M78 30 C86 34 94 48 90 60 C86 52 84 42 80 36 Z"
                fill={hairColor}
              />
              <path
                d="M36 44 C36 25 46 18 60 18 C74 18 84 25 84 44 C80 34 74 27 60 27 C46 27 40 34 36 44 Z"
                fill={hairColor}
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
