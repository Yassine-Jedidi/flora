# iOS Safari Compatibility Issues & Solutions

## Issue: "Invalid regular expression: invalid group specifier name"

### Root Cause

Modern JavaScript regex features like **named capture groups** `(?<name>...)` are not supported in older iOS Safari versions (< iOS 14.5).

### Our Solution

Downgraded `remark-gfm` from v4.0.1 to v3.0.1 which uses Safari-compatible regex patterns.

---

## Issue: Images Display as Squares Instead of Rounded on iOS

### Root Cause

iOS Safari has rendering issues with `border-radius` when combined with:

- `overflow: hidden`
- `position: absolute` (from Next.js Image `fill` prop)
- CSS transforms

### Our Solution

Apply these CSS properties to force hardware acceleration and proper rendering:

```typescript
<div
  className="rounded-[2rem] overflow-hidden isolate"
  style={{
    WebkitBackfaceVisibility: 'hidden',
    WebkitTransform: 'translateZ(0)',
    transform: 'translateZ(0)',
  }}
>
  <Image
    fill
    style={{ borderRadius: 'inherit' }}
  />
</div>
```

**Key properties:**

- `isolate` - Creates a new stacking context
- `WebkitBackfaceVisibility: 'hidden'` - Forces hardware acceleration on Safari
- `transform: translateZ(0)` - Creates a new composite layer
- `borderRadius: 'inherit'` on Image - Ensures image respects container radius

---

## Common iOS Safari Issues

### 1. **Regex Incompatibilities**

**Symptoms:**

- `SyntaxError: Invalid regular expression`
- Works on desktop, fails on iOS

**Common Culprits:**

- Named capture groups: `(?<name>pattern)`
- Lookbehind assertions: `(?<=pattern)`
- `\p{...}` Unicode property escapes (limited support)

**Fix:**

- Use older regex syntax
- Downgrade libraries using modern regex
- Polyfill or transpile with proper targets

### 2. **Border-Radius + Overflow Hidden**

**Issue:** Rounded corners don't render properly
**Fix:** Add hardware acceleration properties (see above)

### 3. **Date/Time Parsing**

**Issue:** `new Date("2024-01-31")` may fail
**Fix:** Use `new Date("2024/01/31")` or proper ISO format with time

### 4. **Touch Event Handling**

**Issue:** Click events don't fire or are delayed
**Fix:**

```typescript
// Add cursor: pointer to clickable elements
className = "cursor-pointer";

// Or use onPointerDown instead of onClick for instant response
onPointerDown = { handleClick };
```

### 5. **Fixed Positioning**

**Issue:** Fixed elements jump when keyboard opens
**Fix:**

```css
/* Use sticky instead of fixed when possible */
position: sticky;
top: 0;
```

### 6. **Viewport Height (100vh)**

**Issue:** 100vh doesn't account for Safari's dynamic UI
**Fix:**

```typescript
// Use dvh (dynamic viewport height) if supported
height: 100dvh;

// Or calculate programmatically
const [vh, setVh] = useState(window.innerHeight);
useEffect(() => {
  const handleResize = () => setVh(window.innerHeight);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 7. **Passive Event Listeners**

**Issue:** Console warnings about passive listeners
**Fix:**

```typescript
element.addEventListener("touchstart", handler, { passive: true });
```

### 8. **LocalStorage in Private Mode**

**Issue:** QuotaExceededError in private browsing
**Fix:**

```typescript
const isStorageAvailable = () => {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch (e) {
    return false;
  }
};
```

---

## Debugging Tools for iOS

### 1. **On-Device Console (Eruda)** ✅ Already Installed

- Floating debug button appears on iPhone
- Shows console logs, network, DOM, storage
- Only works in development mode

### 2. **Chrome Remote Debugging** (Recommended)

1. Install Chrome on iPhone
2. Connect iPhone via USB to Windows
3. Open `chrome://inspect` on Windows
4. Click "inspect" on your device

### 3. **Safari Remote Debugging** (Requires Mac)

- Not available on Windows
- Need MacOS to use Safari Web Inspector

### 4. **Browser Compatibility Checking**

Use [caniuse.com](https://caniuse.com) to check feature support for:

- iPhone XR runs iOS 12+ (up to iOS 17)
- Check Safari 12+ compatibility

---

## Recommended Package Versions for iOS Compatibility

```json
{
  "remark-gfm": "3.0.1", // v4 has regex issues
  "framer-motion": "latest", // Generally good
  "next": "latest" // Has good iOS support
}
```

---

## Testing Checklist for iOS

- [ ] Test on actual iPhone (not just emulator)
- [ ] Test with Safari (primary iOS browser)
- [ ] Test with Chrome on iOS (uses Safari engine)
- [ ] Test in both portrait and landscape
- [ ] Test with different iOS versions if possible
- [ ] Check console for errors using Eruda
- [ ] Test network requests
- [ ] Test form inputs and keyboard behavior
- [ ] Test scroll behavior
- [ ] Test touch gestures (swipe, pinch, etc.)
- [ ] Verify rounded corners display correctly
- [ ] Check image loading and placeholders

---

## Quick Fixes Reference

### Error: "lookbehind assertion not supported"

**Problem:** Using `(?<=...)` in regex
**Fix:** Rewrite regex without lookbehind or use a library polyfill

### Error: Rounded corners not showing

**Problem:** iOS Safari rendering issue
**Fix:** Add `isolate`, `transform: translateZ(0)`, and `WebkitBackfaceVisibility: 'hidden'`

### Error: "Cannot use 'in' operator"

**Problem:** Checking property existence incorrectly
**Fix:** Use `hasOwnProperty` or `Object.prototype.hasOwnProperty.call()`

### Error: "object(...) is not a function"

**Problem:** Optional chaining `?.` or nullish coalescing `??` in old iOS
**Fix:** Update Babel/TypeScript target or use conditionals

---

## Next.js Specific iOS Issues

### 1. **Image Optimization**

iPhone may timeout on large images

```typescript
<Image
  src={url}
  alt=""
  fill
  sizes="(max-width: 768px) 100vw, 520px"
  loading="lazy" // or "eager" for above fold
  quality={85} // Reduce for faster loading
  style={{ borderRadius: 'inherit' }} // For rounded corners
/>
```

### 2. **Client/Server Hydration**

```typescript
// Avoid using window on server
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

---

## Browser Support Targets

Update `browserslist` in package.json:

```json
"browserslist": [
  "ios >= 12",
  "safari >= 12"
]
```

Or in `next.config.js`:

```javascript
module.exports = {
  experimental: {
    browsersListForSwc: true,
  },
  swcMinify: true,
};
```

---

## Useful Resources

- [MDN Browser Compatibility Data](https://github.com/mdn/browser-compat-data)
- [Can I Use](https://caniuse.com)
- [iOS Safari Quirks](https://github.com/koenverburg/ios-safari-quirks)
- [Safari Release Notes](https://developer.apple.com/documentation/safari-release-notes)
- [CSS Triggers](https://csstriggers.com/) - See what CSS properties trigger repaints
