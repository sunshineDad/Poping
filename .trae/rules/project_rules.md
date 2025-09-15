## Color Tokens

```json
{
  "colors": {
    "brand": {
      "primary": "#3B82F6",
      "primary-hover": "#2563EB",
      "blue-gradient": "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
    },
    "neutral": {
      "white": "#FFFFFF",
      "gray-50": "#F9FAFB",
      "gray-100": "#F3F4F6",
      "gray-200": "#E5E7EB",
      "gray-400": "#9CA3AF",
      "gray-600": "#4B5563",
      "gray-800": "#1F2937",
      "gray-900": "#111827"
    },
    "semantic": {
      "success": "#10B981",
      "info": "#3B82F6",
      "warning": "#F59E0B"
    }
  }
}
```

## Typography Tokens

```json
{
  "typography": {
    "fontFamily": {
      "primary": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "mono": "'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px",
      "6xl": "60px"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.7
    }
  }
}
```

## Spacing Tokens

```json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
    "32": "128px",
    "40": "160px",
    "48": "192px",
    "64": "256px"
  }
}
```

## Layout Tokens

```json
{
  "layout": {
    "container": {
      "maxWidth": "1200px",
      "padding": "24px"
    },
    "section": {
      "padding": "80px 0"
    },
    "grid": {
      "columns": {
        "12": "repeat(12, 1fr)",
        "3": "repeat(3, 1fr)",
        "2": "repeat(2, 1fr)"
      },
      "gap": "24px"
    }
  }
}
```

## Component Tokens

```json
{
  "components": {
    "button": {
      "primary": {
        "backgroundColor": "#3B82F6",
        "color": "#FFFFFF",
        "padding": "12px 24px",
        "borderRadius": "8px",
        "fontWeight": 600,
        "fontSize": "16px",
        "border": "none",
        "cursor": "pointer",
        "transition": "all 0.2s ease"
      },
      "secondary": {
        "backgroundColor": "transparent",
        "color": "#4B5563",
        "padding": "12px 24px",
        "borderRadius": "8px",
        "fontWeight": 500,
        "fontSize": "16px",
        "border": "1px solid #E5E7EB",
        "cursor": "pointer",
        "transition": "all 0.2s ease"
      }
    },
    "card": {
      "backgroundColor": "#FFFFFF",
      "borderRadius": "12px",
      "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
      "padding": "24px",
      "border": "1px solid #E5E7EB"
    },
    "input": {
      "backgroundColor": "#FFFFFF",
      "border": "1px solid #E5E7EB",
      "borderRadius": "8px",
      "padding": "12px 16px",
      "fontSize": "16px",
      "color": "#1F2937",
      "placeholder": "#9CA3AF"
    },
    "navigation": {
      "height": "72px",
      "backgroundColor": "#FFFFFF",
      "borderBottom": "1px solid #E5E7EB",
      "padding": "0 24px"
    }
  }
}
```

## Animation Tokens

```json
{
  "animation": {
    "duration": {
      "fast": "0.15s",
      "normal": "0.2s",
      "slow": "0.3s"
    },
    "easing": {
      "ease": "ease",
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out"
    }
  }
}
```

## Border Radius Tokens

```json
{
  "borderRadius": {
    "none": "0px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  }
}
```

## Shadow Tokens

```json
{
  "shadows": {
    "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0 1px 3px rgba(0, 0, 0, 0.1)",
    "lg": "0 4px 6px rgba(0, 0, 0, 0.1)",
    "xl": "0 10px 15px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px rgba(0, 0, 0, 0.25)"
  }
}
```