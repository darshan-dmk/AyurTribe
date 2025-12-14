# Prakriti Questionnaire Auto-Scroll Feature

## Feature Added
Auto-scrolling to the next question when a user selects an answer in the Prakriti Questionnaire.

## Implementation Details

### Changes Made to `PrakritiQuestionnaire.tsx`

#### 1. **Added useRef Import** (Line 2)
```tsx
import React, { useState, useEffect, useRef } from 'react';
```

#### 2. **Created Refs Object for Questions** (Line ~32)
```tsx
// Refs for each question to enable smooth scrolling
const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
```

This creates a ref object that will store references to all question card DOM elements, indexed by question ID.

#### 3. **Enhanced handleAnswer Function** (Line ~118)
Added auto-scroll logic after answer selection:

```tsx
const handleAnswer = (question: Question, optionId: string) => {
  // ... existing answer handling code ...
  
  // Auto-scroll to next question after a short delay
  setTimeout(() => {
    const currentQuestionIndex = currentQuestions.findIndex(q => q.id === question.id);
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    if (nextQuestionIndex < currentQuestions.length) {
      const nextQuestion = currentQuestions[nextQuestionIndex];
      const nextQuestionElement = questionRefs.current[nextQuestion.id];
      
      if (nextQuestionElement) {
        // Calculate scroll position with offset for sticky progress bar
        const yOffset = -100; // Offset to account for sticky header/progress bar
        const y = nextQuestionElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({ 
          top: y, 
          behavior: 'smooth' 
        });
      }
    }
  }, 300); // Small delay to let the selection animation complete
};
```

**Key Features:**
- **300ms delay**: Allows the selection animation to complete before scrolling
- **-100px offset**: Accounts for the sticky progress bar at the top
- **Smooth scrolling**: Uses `behavior: 'smooth'` for a pleasant UX
- **Boundary check**: Only scrolls if there's a next question in the current page

#### 4. **Added Ref to Question Cards** (Line ~324)
```tsx
<motion.div
  key={question.id}
  ref={(el) => {
    questionRefs.current[question.id] = el;
  }}
  // ... other props ...
>
```

This attaches a ref to each question card so we can scroll to it programmatically.

## User Experience Flow

1. **User clicks an answer** → Answer selection animates and state updates
2. **300ms delay** → Allows visual feedback of the selection
3. **Auto-scroll triggers** → Smoothly scrolls to the next question
4. **User sees next question** → Ready to answer, creating a natural flow

## Behavior Details

- ✅ Works on both Page 1 (Physical Traits) and Page 2 (Lifestyle & Mind)
- ✅ Does NOT scroll if on the last question of a page
- ✅ Respects sticky progress bar (scrolls with 100px offset)
- ✅ Smooth animation enhances user experience
- ✅ Does not interfere with existing design or functionality
- ✅ Works seamlessly with the existing page navigation buttons

## Benefits

1. **Better UX**: Users naturally flow through the questionnaire
2. **Reduced cognitive load**: No need to manually scroll or search for the next question
3. **Faster completion**: Reduces friction in the assessment process
4. **Mobile-friendly**: Especially useful on mobile devices where scrolling manually can be cumbersome
5. **Accessibility**: Helps users maintain context and know where they are in the form

## Testing Recommendations

1. Test on desktop browsers (Chrome, Firefox, Safari, Edge)
2. Test on mobile devices (iOS Safari, Android Chrome)
3. Verify smooth scrolling on both Page 1 and Page 2
4. Ensure no scroll occurs on the last question of each page
5. Check that the sticky progress bar doesn't obscure the next question
6. Verify selection animations complete before scroll begins

## Notes

- No changes to existing UI/design
- No changes to existing functionality
- Pure enhancement that improves user flow
- Minimal code addition (~25 lines total)
