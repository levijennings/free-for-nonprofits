# Free For NonProfits - Component Library

A comprehensive, production-ready UI component library built for the "Free For NonProfits" Next.js application. All components are fully typed with TypeScript, styled with Tailwind CSS, and follow accessibility best practices.

## Brand Guidelines

- **Primary Color**: Trust Blue (#2563EB) - `bg-blue-600`, `text-blue-600`
- **Font**: Plus Jakarta Sans
- **Mode**: Light mode default

## Component Structure

```
src/components/
├── ui/                          # Core UI components
│   ├── Avatar.tsx               # User avatar with fallback initials
│   ├── Badge.tsx                # Small label with variants
│   ├── Button.tsx               # Primary button component
│   ├── Card.tsx                 # Generic card container
│   ├── EmptyState.tsx           # Empty state display
│   ├── Input.tsx                # Text input with validation
│   ├── Modal.tsx                # Dialog overlay
│   ├── Select.tsx               # Dropdown select
│   ├── Skeleton.tsx             # Loading placeholder
│   ├── StarRating.tsx           # Star rating display/input
│   ├── Toast.tsx                # Toast notification system
│   └── index.ts                 # Component exports
├── tools/                       # Tool-specific components
│   ├── CategoryFilter.tsx       # Horizontal category pills
│   ├── SearchBar.tsx            # Search input with debounce
│   ├── ToolCard.tsx             # Tool display card
│   ├── ToolGrid.tsx             # Responsive grid layout
│   └── index.ts                 # Component exports
├── layout/                      # Layout components
│   ├── Footer.tsx               # Page footer
│   ├── Header.tsx               # Navigation header
│   ├── Sidebar.tsx              # Category sidebar
│   └── index.ts                 # Component exports
└── index.ts                     # Root component exports
```

## UI Components

### Input

Text input with label, error state, and helper text support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errorMessage}
  helperText="We'll never share your email"
  size="md"
  variant="default"
  required
/>
```

**Props**:
- `label?: string` - Label text
- `error?: string` - Error message
- `helperText?: string` - Helper text below input
- `size?: 'sm' | 'md' | 'lg'` - Input size
- `variant?: 'default' | 'search'` - Input variant
- All standard HTML input attributes

**Variants**:
- `default` - Standard text input
- `search` - Input with search icon

**Sizes**: sm (small), md (medium), lg (large)

---

### Select

Dropdown select with label and error state.

```tsx
import { Select } from '@/components/ui';

<Select
  label="Category"
  placeholder="Select a category..."
  options={[
    { value: 'design', label: 'Design Tools' },
    { value: 'marketing', label: 'Marketing' },
  ]}
  error={errorMessage}
  required
/>
```

**Props**:
- `label?: string` - Label text
- `placeholder?: string` - Placeholder text
- `error?: string` - Error message
- `options: SelectOption[]` - Array of options
- All standard HTML select attributes

---

### Button

Primary button with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click me
</Button>
```

**Props**:
- `variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'` - Button style
- `size?: 'sm' | 'md' | 'lg'` - Button size
- All standard HTML button attributes

**Variants**:
- `primary` - Trust Blue background (primary action)
- `secondary` - White with border (secondary action)
- `ghost` - No background (tertiary action)
- `destructive` - Red background (danger action)

---

### Card

Generic container card with optional header, body, and footer sections.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui';

<Card hoverable>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    Content goes here
  </CardBody>
  <CardFooter>
    Actions
  </CardFooter>
</Card>
```

**Props**:
- `hoverable?: boolean` - Enable hover effect
- `CardHeader` - Header section with border
- `CardBody` - Main content area
- `CardFooter` - Footer section with gray background

---

### Badge

Small label component with color variants.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Free</Badge>
<Badge variant="warning">Freemium</Badge>
<Badge variant="info">Pro</Badge>
<Badge variant="outline">Category</Badge>
```

**Props**:
- `variant?: 'default' | 'success' | 'warning' | 'info' | 'outline'` - Badge style

**Variants**:
- `default` - Blue background (primary)
- `success` - Green background (success/free)
- `warning` - Yellow background (warning/paid)
- `info` - Cyan background (information)
- `outline` - White with border

---

### Avatar

User avatar with image or fallback initials.

```tsx
import { Avatar } from '@/components/ui';

<Avatar
  src="https://example.com/avatar.jpg"
  alt="User name"
  size="md"
/>

// With fallback initials
<Avatar
  initials="JD"
  alt="John Doe"
  size="md"
/>
```

**Props**:
- `src?: string` - Avatar image URL
- `initials?: string` - Fallback initials (2 characters)
- `size?: 'sm' | 'md' | 'lg'` - Avatar size
- `alt: string` - Alt text (required)

**Sizes**: sm (8px), md (10px), lg (12px)

---

### StarRating

Star rating display and interactive input.

```tsx
import { StarRating } from '@/components/ui';

// Display only
<StarRating rating={4.5} size="md" showText />

// Interactive
<StarRating
  rating={3}
  onRate={(rating) => handleRate(rating)}
  interactive
  size="lg"
/>
```

**Props**:
- `rating: number` - Current rating (0-5)
- `onRate?: (rating: number) => void` - Rate callback
- `interactive?: boolean` - Enable clicking to rate
- `showText?: boolean` - Show numeric rating text
- `size?: 'sm' | 'md' | 'lg'` - Star size

---

### Modal

Dialog overlay with title, close button, and optional footer.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={<button>Cancel</button>}
>
  Are you sure?
</Modal>
```

**Props**:
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback
- `title?: string` - Modal title
- `children: React.ReactNode` - Modal content
- `footer?: React.ReactNode` - Footer content/actions
- `closeButton?: boolean` - Show close button (default: true)

**Features**:
- Keyboard navigation (ESC to close)
- Click outside to close
- Portal rendering
- Accessibility support

---

### Toast

Toast notification system with context provider and hook.

```tsx
import { ToastProvider, useToast } from '@/components/ui';

// Wrap app with provider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const { addToast } = useToast();

  return (
    <button onClick={() => addToast('Success!', 'success')}>
      Show Toast
    </button>
  );
}
```

**Hook API**:
- `addToast(message, variant?, duration?)` - Show toast
- `removeToast(id)` - Remove toast
- `toasts` - Current toasts array

**Variants**: success, error, warning, info
**Default duration**: 4000ms (auto-dismiss)

---

### Skeleton

Loading placeholder with multiple variants.

```tsx
import { Skeleton } from '@/components/ui';

<Skeleton variant="text" count={3} />
<Skeleton variant="circle" width={48} height={48} />
<Skeleton variant="card" height={200} />
<Skeleton variant="rectangle" />
```

**Props**:
- `variant?: 'text' | 'circle' | 'card' | 'rectangle'` - Skeleton shape
- `width?: string | number` - Custom width
- `height?: string | number` - Custom height
- `count?: number` - Multiple skeletons

**Variants**:
- `text` - Inline text placeholder (h-4)
- `circle` - Circular avatar placeholder (w-12 h-12)
- `card` - Full card placeholder (h-40)
- `rectangle` - Rectangle placeholder (h-24)

---

### EmptyState

Empty state display with optional icon and action button.

```tsx
import { EmptyState } from '@/components/ui';
import { Search } from 'lucide-react';

<EmptyState
  icon={Search}
  title="No results found"
  description="Try adjusting your search terms"
  action={{
    label: "Clear filters",
    onClick: () => handleClear()
  }}
/>
```

**Props**:
- `icon?: LucideIcon` - Icon from lucide-react
- `title: string` - Main heading
- `description?: string` - Subtitle
- `action?: { label, onClick }` - Action button
- `className?: string` - Custom classes

---

## Tool Components

### ToolCard

Product card for displaying tools in the directory.

```tsx
import { ToolCard } from '@/components/tools';

<ToolCard
  tool={{
    id: '1',
    name: 'Figma',
    logo: 'https://...',
    category: 'Design',
    pricingModel: 'freemium',
    rating: 4.8,
    reviews: 342,
    description: 'Design and prototype software'
  }}
/>
```

**Props**:
- `tool: Tool` - Tool object with:
  - `id: string`
  - `name: string`
  - `logo?: string`
  - `category: string`
  - `pricingModel: 'free' | 'freemium' | 'paid'`
  - `rating: number` (0-5)
  - `reviews: number`
  - `description: string`

---

### ToolGrid

Responsive grid layout for tool cards.

```tsx
import { ToolGrid } from '@/components/tools';

<ToolGrid
  tools={toolsArray}
  isLoading={loading}
  onRefresh={handleRefresh}
/>
```

**Props**:
- `tools: Tool[]` - Array of tool objects
- `isLoading?: boolean` - Loading state
- `onRefresh?: () => void` - Refresh callback

**Responsive**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

---

### CategoryFilter

Horizontal scrollable category pills.

```tsx
import { CategoryFilter } from '@/components/tools';

<CategoryFilter
  categories={[
    { id: 'design', name: 'Design', count: 24 },
    { id: 'marketing', name: 'Marketing', count: 18 },
  ]}
  selectedCategory={selected}
  onSelectCategory={setSelected}
/>
```

**Props**:
- `categories: Category[]` - Array of categories with id, name, count
- `selectedCategory?: string` - Currently selected category ID
- `onSelectCategory: (id) => void` - Selection callback

**Features**:
- Horizontal scroll with arrow buttons
- Keyboard navigation
- Category counts
- Active state indicator

---

### SearchBar

Search input with debounced search handler.

```tsx
import { SearchBar } from '@/components/tools';

<SearchBar
  placeholder="Search tools..."
  onSearch={handleSearch}
  debounceMs={300}
/>
```

**Props**:
- `placeholder?: string` - Input placeholder
- `onSearch: (query) => void` - Search callback
- `debounceMs?: number` - Debounce delay (default: 300ms)

---

## Layout Components

### Header

Top navigation bar with logo and auth buttons.

```tsx
import { Header } from '@/components/layout';

<Header isAuthenticated={false} />
```

**Props**:
- `isAuthenticated?: boolean` - Show auth or dashboard buttons

**Features**:
- Sticky positioning
- Mobile hamburger menu
- Responsive navigation
- Auth button variants

---

### Footer

Page footer with links and copyright.

```tsx
import { Footer } from '@/components/layout';

<Footer />
```

**Sections**:
- Product links (Browse, Categories, Submit)
- Resources links (About, Blog, Contact)
- Legal links (Privacy, Terms)
- Copyright notice

---

### Sidebar

Category navigation sidebar with nested support.

```tsx
import { Sidebar } from '@/components/layout';

<Sidebar
  categories={categoriesArray}
  selectedCategory={selected}
  onSelectCategory={setSelected}
  isOpen={true}
/>
```

**Props**:
- `categories: SidebarCategory[]` - Category tree structure
- `selectedCategory?: string` - Selected category ID
- `onSelectCategory: (id) => void` - Selection callback
- `isOpen?: boolean` - Sidebar visibility
- `onClose?: () => void` - Close callback

**Features**:
- Nested categories with expand/collapse
- Category counts
- Active indicator
- Mobile responsive

---

## TypeScript Types

All components export their prop interfaces:

```tsx
import {
  InputProps,
  SelectProps,
  ButtonProps,
  CardProps,
  BadgeProps,
  ModalProps,
  ToastContextType,
  SkeletonProps,
  EmptyStateProps,
  AvatarProps,
  StarRatingProps,
  Tool,
  Category,
} from '@/components';
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Semantic HTML**: Proper heading hierarchy, label associations
- **ARIA Labels**: For icon-only buttons, navigation landmarks
- **Keyboard Navigation**: Tab navigation, ESC to close modals
- **Focus Management**: Visible focus indicators
- **Color Contrast**: 4.5:1 minimum for text
- **Screen Readers**: Proper aria-labels and descriptions

---

## Customization

### Using Tailwind CSS

All components accept a `className` prop for additional styling:

```tsx
<Button className="w-full" variant="primary">
  Full Width Button
</Button>
```

### Component Composition

Components are designed to be composed together:

```tsx
<Card hoverable>
  <CardBody>
    <h3>Title</h3>
    <p>Content</p>
    <Button>Action</Button>
  </CardBody>
</Card>
```

---

## Color Reference

```
Primary Blue: bg-blue-600, text-blue-600, border-blue-600
Light Blue: bg-blue-100, text-blue-700
Success Green: bg-green-100, text-green-800
Warning Yellow: bg-yellow-100, text-yellow-800
Error Red: bg-red-100, text-red-800
Info Cyan: bg-cyan-100, text-cyan-800
Neutral Gray: bg-gray-100, text-gray-700
```

---

## Best Practices

1. **Use forwardRef**: Form components support ref forwarding
2. **Provide Labels**: Always include labels for form inputs
3. **Validate Input**: Use error states for form validation
4. **Accessible Icons**: Use aria-labels for icon-only buttons
5. **Loading States**: Use Skeleton for async data loading
6. **Toast for Feedback**: Use Toast for non-blocking notifications
7. **Modal for Confirmation**: Use Modal for destructive actions
8. **Empty States**: Show EmptyState instead of blank screens

---

## Version

Current: 1.0.0
Built with: Next.js 14, Tailwind CSS, React 18+, TypeScript 5+

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

All components use modern CSS and JavaScript features.
