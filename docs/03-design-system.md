# Design Guidelines - AI & CS Club Website

## Design Philosophy

### Core Principles
- **Tech-First Aesthetic**: Thiết kế phản ánh tính chất công nghệ và AI
- **Developer Experience**: Interface familiar với developers
- **Modern Minimalism**: Clean, functional, không rối mắt
- **Performance-Oriented**: Fast loading, smooth interactions

## Visual Identity

### Color Palette

#### Primary Colors
```css
/* Professional tech colors */
--primary-blue: #2563EB;      /* Professional blue */
--primary-slate: #475569;     /* Sophisticated slate */
--accent-blue: #3B82F6;       /* Subtle accent */
--accent-gray: #6B7280;       /* Muted accent */

/* Neutral Base - More sophisticated */
--dark-bg: #0F172A;          /* Deep navy */
--dark-surface: #1E293B;      /* Card backgrounds */
--dark-border: #334155;       /* Subtle borders */
--text-primary: #F8FAFC;      /* Soft white text */
--text-secondary: #CBD5E1;    /* Professional gray */
--text-tertiary: #94A3B8;     /* Muted text */
```

#### Semantic Colors
```css
--success: #059669;          /* Professional green */
--warning: #D97706;          /* Muted orange */
--error: #DC2626;            /* Professional red */
--info: #2563EB;             /* Consistent with primary */
```

### Typography

#### Font Stack
```css
/* Primary: Clean, modern sans-serif */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code: Developer favorite monospace */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

/* Display: For large headings */
--font-display: 'Inter', system-ui, sans-serif;
```

#### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px - Captions */
--text-sm: 0.875rem;   /* 14px - Small text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section titles */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Hero titles */
--text-5xl: 3rem;      /* 48px - Display titles */
```

## Layout System

### Grid & Spacing
```css
/* 8px base unit system */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */

/* Container widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Responsive Breakpoints
```css
/* Mobile-first approach */
--bp-sm: 640px;        /* Tablet */
--bp-md: 768px;        /* Small laptop */
--bp-lg: 1024px;       /* Desktop */
--bp-xl: 1280px;       /* Large desktop */
--bp-2xl: 1536px;      /* Ultra wide */
```

## Component Design Patterns

### Cards & Surfaces
```css
/* Project cards, profile cards, etc. */
.card {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--primary-blue);
  box-shadow: 0 8px 25px rgba(0, 102, 255, 0.15);
}
```

### Buttons
```css
/* Primary action buttons */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary:hover {
  background: var(--accent-blue);
}

/* Ghost buttons for secondary actions */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--dark-border);
  color: var(--text-secondary);
  border-radius: 8px;
}
```

### Code & Terminal Elements
```css
/* Inline code */
.code-inline {
  background: var(--dark-surface);
  color: var(--accent-cyan);
  font-family: var(--font-mono);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
}

/* Code blocks */
.code-block {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  border-radius: 6px;
  overflow-x: auto;
  font-family: var(--font-mono);
}
```

## AI/CS Specific Design Elements

### 1. Neural Network Inspired Graphics
- **Dot connections**: Animated connecting lines between elements
- **Node visualizations**: Circular elements with connecting paths
- **Circuit patterns**: Subtle background patterns resembling circuit boards

### 2. Terminal/IDE Aesthetics
```css
/* Terminal-style command prompts */
.terminal {
  background: #0D1117;
  color: #58A6FF;
  font-family: var(--font-mono);
  padding: 16px;
  border-radius: 8px;
}

.terminal::before {
  content: '$ ';
  color: var(--accent-green);
}
```

### 3. Data Visualization Elements
- **Progress bars**: Gradient fills showing contribution percentages
- **Pie charts**: For project contribution visualization
- **Timeline**: Git-style commit timeline for project history
- **Stats cards**: Dashboard-style metrics display

### 4. Interactive Elements
```css
/* Glitch effect for hover states */
.glitch-effect:hover {
  animation: glitch 0.3s ease-in-out;
}

/* Neon glow effects */
.neon-border {
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
  border: 1px solid var(--accent-cyan);
}

/* Matrix-style text animation */
.matrix-text {
  font-family: var(--font-mono);
  color: var(--accent-green);
  text-shadow: 0 0 10px currentColor;
}
```

## Icon System

### Icon Library: Lucide React
```jsx
// Tech-focused icons
import {
  Code,
  Database,
  GitBranch,
  Terminal,
  Cpu,
  Brain,
  Network,
  Zap,
  Layers,
  Globe
} from 'lucide-react'
```

### Custom AI Icons
- Neural network diagrams
- ML model representations
- Algorithm flowcharts
- Data pipeline visualizations

## Animation & Interactions

### Micro-interactions
```css
/* Smooth transitions */
* {
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

/* Loading states */
.loading {
  background: linear-gradient(90deg,
    var(--dark-surface) 25%,
    rgba(255,255,255,0.1) 50%,
    var(--dark-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

### Page Transitions
- **Fade in**: Content appears with opacity transition
- **Slide up**: Cards animate from bottom
- **Stagger**: List items animate with delay

## Component Specifications

### Navigation Bar
```jsx
// Sticky header with glass morphism
<nav className="sticky top-0 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
  <div className="container mx-auto px-4">
    {/* Logo + Navigation */}
  </div>
</nav>
```

### Project Cards
```jsx
<div className="group relative bg-dark-surface border border-dark-border rounded-xl overflow-hidden hover:border-primary-blue transition-all duration-300">
  {/* Thumbnail với overlay gradient */}
  <div className="aspect-video bg-gradient-to-br from-primary-blue/20 to-primary-purple/20">
    <img src={thumbnail} className="w-full h-full object-cover" />
  </div>

  {/* Content */}
  <div className="p-6">
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-text-secondary mb-4">{description}</p>

    {/* Tech stack tags */}
    <div className="flex flex-wrap gap-2 mb-4">
      {techStack.map(tech => (
        <span className="px-3 py-1 bg-primary-blue/20 text-accent-cyan rounded-full text-sm font-mono">
          {tech}
        </span>
      ))}
    </div>

    {/* Contribution chart */}
    <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
      {/* Stacked progress bars */}
    </div>
  </div>
</div>
```

### Profile Cards
```jsx
<div className="bg-dark-surface border border-dark-border rounded-xl p-6">
  {/* Avatar với neon border khi hover */}
  <div className="relative mb-4">
    <img className="w-16 h-16 rounded-full group-hover:shadow-neon transition-all" />
    {/* Online status indicator */}
  </div>

  {/* Skills as animated progress bars */}
  <div className="space-y-2">
    {skills.map(skill => (
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">{skill.name}</span>
        <div className="flex-1 mx-3 h-2 bg-dark-bg rounded-full">
          <div
            className="h-full bg-gradient-to-r from-primary-blue to-accent-cyan rounded-full transition-all duration-1000"
            style={{width: `${skill.level}%`}}
          />
        </div>
      </div>
    ))}
  </div>
</div>
```

## Accessibility & Performance

### A11y Guidelines
- High contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader friendly
- Focus indicators visible

### Performance Targets
- First Contentful Paint < 2s
- Largest Contentful Paint < 3s
- Cumulative Layout Shift < 0.1
- Interactive within 3s

## Brand Elements

### Logo Concepts
- Geometric neural network
- Abstract brain + code symbols
- Interconnected nodes
- Circuit board patterns

### Tagline Ideas
- "Building Tomorrow's Intelligence"
- "Code. Create. Innovate."
- "Where AI Meets Artistry"
- "Shaping the Future of Tech"

Thiết kế này sẽ tạo ra một website vừa professional vừa thể hiện được tính chất công nghệ cao của câu lạc bộ AI Agent.