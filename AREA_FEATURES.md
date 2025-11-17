# Area-Based Property Querying Features

## Overview
Added comprehensive area-based property querying functionality to the chatbot. Users can now ask about properties in specific areas, view all available areas, and discover properties that are near each other (in the same area).

## New Features

### 1. **List All Areas**
**User Queries:**
- "Show all areas where properties are located"
- "What areas do you have properties in?"
- "List all property areas"

**Response:** Returns a formatted list of all unique areas from the "Property By Area" sheet column, sorted alphabetically.

**Example Output:**
```
Here are all the areas where we have properties:

• Casa Grande, Arizona
• Las Vegas, Nevada
• Phoenix, Arizona
• Scottsdale, Arizona

Would you like to know which properties are in a specific area?
```

---

### 2. **Properties in Specific Area**
**User Queries:**
- "Which properties are in Casa Grande, Arizona?"
- "Properties in Las Vegas, Nevada?"
- "Show me properties in Phoenix"
- "What properties are in [any area]?"

**Response:** Returns all properties matching the specified area, including unit number, title, and area name.

**Example Output:**
```
Here are the properties in **Casa Grande, Arizona**:

• Unit 5 – Desert Oasis Retreat (Casa Grande, Arizona)
• Unit 12 – Casa Grande Villa (Casa Grande, Arizona)
• Unit 18 – Arizona Desert Home (Casa Grande, Arizona)
```

---

### 3. **Properties Near Each Other**
**User Queries:**
- "Which properties are near to each other?"
- "Which properties are next to each other?"
- "Show me properties close to each other"
- "Properties in the same area?"

**Response:** Groups and displays all areas containing multiple properties, sorted by count (areas with most properties first). Shows how many properties are in each area.

**Example Output:**
```
Here are properties grouped by area (properties near each other):

**Las Vegas, Nevada** (8 properties):
• Unit 1 – The Strip View
• Unit 2 – Downtown Vegas
• Unit 3 – Fremont Suite
• Unit 4 – Boulder Station
• Unit 5 – Red Rock View
• Unit 6 – Henderson Home
• Unit 7 – Paradise View
• Unit 8 – Valley Villa

**Phoenix, Arizona** (5 properties):
• Unit 10 – Downtown Phoenix
• Unit 11 – Scottsdale North
• Unit 13 – Tempe Terrace
• Unit 15 – Chandler Condo
• Unit 17 – Gilbert Green

**Casa Grande, Arizona** (2 properties):
• Unit 5 – Desert Oasis Retreat
• Unit 12 – Casa Grande Villa
```

---

## Implementation Details

### Files Modified:

#### 1. **api/intentExtractor.js**
- Added three new dataset intent types to the system prompt:
  - `list_all_areas` - Identify user intent to list all areas
  - `properties_in_area` - Extract specific area name from user query
  - `properties_near_each_other` - Detect queries about nearby/grouped properties
- Updated examples in prompt to guide intent extraction

#### 2. **api/propertyHandler.js**

**FIELD_TO_COLUMNS Update:**
- Added area field mapping: `area: ["Property By Area", "Area", "Location Area"]`
- Supports multiple column name variations for flexibility

**New Case Handlers in handleDatasetQuery:**

**Case: `list_all_areas`**
- Extracts unique areas from "Property By Area" column
- Returns sorted alphabetical list
- Prompts user for follow-up questions

**Case: `properties_in_area`**
- Takes `datasetValue` as the area name
- Performs fuzzy matching (case-insensitive, includes/contains logic)
- Returns list of properties with their areas
- Suggests showing all areas if no match found

**Case: `properties_near_each_other`**
- Groups properties by area from "Property By Area" column
- Filters to only areas with 2+ properties
- Sorts by property count (descending)
- Returns formatted grouped list with property counts

**formatResponse Update:**
- Added friendly mapping for area field

---

## Data Source
- **Sheet Tab:** "Info" (main properties sheet)
- **Column Used:** "Property By Area"
- This column should contain area/location information in format like "City, State"

---

## Integration Flow

```
User Message
    ↓
intentExtractor.js (extract intent & intent type)
    ↓
Extracted Intent Type = "dataset_query"
    ↓
proxyWebhook.js routes to handleDatasetQuery()
    ↓
propertyHandler.js switch() matches:
  - list_all_areas
  - properties_in_area
  - properties_near_each_other
    ↓
loadSheet() → Loads "Info" sheet with area data
    ↓
Query Logic (filter, group, format)
    ↓
Formatted Response → Return to User
```

---

## Example User Conversations

### Example 1: Explore all areas
```
User: "What areas do you have properties in?"
Bot: "Here are all the areas where we have properties:

• Casa Grande, Arizona
• Las Vegas, Nevada
• Phoenix, Arizona
• Scottsdale, Arizona
• Tempe, Arizona

Would you like to know which properties are in a specific area?"
```

### Example 2: Properties in specific area
```
User: "Which properties are in Las Vegas, Nevada?"
Bot: "Here are the properties in **Las Vegas, Nevada**:

• Unit 1 – The Strip View (Las Vegas, Nevada)
• Unit 2 – Downtown Vegas (Las Vegas, Nevada)
• Unit 3 – Fremont Suite (Las Vegas, Nevada)
• Unit 4 – Boulder Station (Las Vegas, Nevada)"
```

### Example 3: Find nearby properties
```
User: "Which properties are near each other?"
Bot: "Here are properties grouped by area (properties near each other):

**Las Vegas, Nevada** (4 properties):
• Unit 1 – The Strip View
• Unit 2 – Downtown Vegas
• Unit 3 – Fremont Suite
• Unit 4 – Boulder Station

**Phoenix, Arizona** (3 properties):
• Unit 10 – Downtown Phoenix
• Unit 11 – Scottsdale North
• Unit 13 – Tempe Terrace"
```

---

## Benefits

1. **Area Discovery** - Users can easily learn what areas have properties
2. **Proximity Awareness** - Users can find properties in the same area/location
3. **Smart Grouping** - Properties are automatically grouped by area
4. **Flexible Matching** - Case-insensitive, supports partial area names
5. **User-Friendly** - Natural language queries with helpful prompts
6. **Scalable** - Works with any number of areas and properties

---

## Future Enhancements

- Distance-based matching (integrate real coordinates)
- Price comparison across areas
- Amenity comparison for nearby properties
- Area statistics (average price, rating, guest capacity per area)
- Interactive map view of areas
