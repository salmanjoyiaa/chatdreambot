# Area-Based Queries - Quick Reference Guide

## 🗺️ Query Types

### 1. List All Areas
```
User: "Show all areas with properties"
User: "What locations do you have?"
User: "List all property areas"

Bot Response:
✓ Returns alphabetically sorted list of all unique areas
✓ Suggests asking about specific areas
```

### 2. Properties in Specific Area
```
User: "Which properties are in Casa Grande, Arizona?"
User: "Show me properties in Las Vegas"
User: "Properties in [any area]?"

Bot Response:
✓ Returns all properties in that area with unit number + title
✓ Shows property location
✓ Handles partial area names (e.g., "Las Vegas" matches "Las Vegas, Nevada")
✓ Suggests listing all areas if no match
```

### 3. Properties Near Each Other
```
User: "Which properties are near to each other?"
User: "Show me properties close to each other"
User: "Properties in the same area?"

Bot Response:
✓ Groups properties by area
✓ Only shows areas with 2+ properties
✓ Sorted by property count (most properties first)
✓ Shows count of properties per area
```

---

## 🎯 Query Patterns

| Pattern | Example | Intent Type |
|---------|---------|------------|
| List all areas | "What areas..." | `list_all_areas` |
| List all areas | "Show areas..." | `list_all_areas` |
| List all areas | "Which locations..." | `list_all_areas` |
| Specific area | "...in [area]" | `properties_in_area` |
| Specific area | "Properties in..." | `properties_in_area` |
| Specific area | "Which properties in..." | `properties_in_area` |
| Near/grouped | "...near each other" | `properties_near_each_other` |
| Near/grouped | "...same area" | `properties_near_each_other` |
| Near/grouped | "...close to each other" | `properties_near_each_other` |

---

## 🔄 How It Works

```
INPUT: User Question
   ↓
INTENT EXTRACTION: AI identifies intent type
   ↓
   ├─ list_all_areas
   ├─ properties_in_area (extracts area value)
   └─ properties_near_each_other
   ↓
PROPERTY HANDLER: 
   ├─ Loads sheet data from "Info" tab
   ├─ Reads "Property By Area" column
   ├─ Filters/groups properties
   └─ Formats response
   ↓
OUTPUT: Formatted property list
```

---

## 📋 Response Format Examples

### All Areas Response
```
Here are all the areas where we have properties:

• Casa Grande, Arizona
• Las Vegas, Nevada
• Phoenix, Arizona
• Scottsdale, Arizona

Would you like to know which properties are in a specific area?
```

### Specific Area Response
```
Here are the properties in **Las Vegas, Nevada**:

• Unit 1 – The Strip View (Las Vegas, Nevada)
• Unit 2 – Downtown Vegas (Las Vegas, Nevada)
• Unit 3 – Fremont Suite (Las Vegas, Nevada)
```

### Near Each Other Response
```
Here are properties grouped by area (properties near each other):

**Las Vegas, Nevada** (4 properties):
• Unit 1 – The Strip View
• Unit 2 – Downtown Vegas
• Unit 3 – Fremont Suite
• Unit 4 – Boulder Station

**Phoenix, Arizona** (2 properties):
• Unit 10 – Downtown Phoenix
• Unit 11 – Scottsdale North
```

---

## 🛠️ Configuration

**Data Source:**
- Sheet Tab: `Info`
- Column Name: `Property By Area`
- Fallback Names: `Area`, `Location Area`

**Case Handling:**
- All area matching is **case-insensitive**
- Supports **partial matches** (e.g., "Vegas" matches "Las Vegas, Nevada")
- Uses **includes/contains logic** for flexibility

---

## ✅ Testing Checklist

- [ ] User can ask "What areas do you have?"
- [ ] User can ask "Which properties are in [specific area]?"
- [ ] User can ask "Which properties are near to each other?"
- [ ] Bot returns areas in alphabetical order
- [ ] Bot returns properties with correct grouping
- [ ] Partial area names work (e.g., "Vegas", "Arizona")
- [ ] Bot suggests help when no matches found
- [ ] No errors in console

---

## 🚀 Example Conversations

### Conversation 1: Discovery
```
User: "What areas are available?"
Bot: [Lists all areas]
User: "Tell me about Las Vegas"
Bot: [Shows properties in Las Vegas]
```

### Conversation 2: Proximity Search
```
User: "Which properties are nearby?"
Bot: [Groups properties by area, shows which areas have multiple properties]
User: "I'm interested in Phoenix"
Bot: [Shows all Phoenix properties]
```

### Conversation 3: Specific Location
```
User: "Do you have anything in Arizona?"
Bot: [Shows all Arizona properties grouped by city]
User: "What about Casa Grande specifically?"
Bot: [Shows Casa Grande properties]
```

---

## 📝 Technical Details

**New Intent Types:**
- `list_all_areas` - List all property areas
- `properties_in_area` - Show properties in specific area
- `properties_near_each_other` - Show grouped properties by area

**Files Modified:**
1. `api/intentExtractor.js` - Updated system prompt with new intent types
2. `api/propertyHandler.js` - Added 3 new case handlers + area field mapping
3. `AREA_FEATURES.md` - Comprehensive feature documentation (this file)

**No Breaking Changes:**
- All existing queries remain functional
- New features are additive only
- Backward compatible with existing property queries
