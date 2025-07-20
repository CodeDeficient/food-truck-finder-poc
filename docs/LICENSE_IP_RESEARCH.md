# Food Truck Finder - IP Protection & Licensing Research

**Date:** 2025-01-20  
**Purpose:** Research licensing options that protect business interests while allowing code snippet sharing

---

## 🎯 **BUSINESS GOALS**

### **Protection Objectives:**
- **Prevent full project clones** that could saturate the food truck discovery market
- **Block commercial competitors** from copying the entire application
- **Maintain competitive advantage** in this specific niche
- **Protect business model** and market positioning

### **Permitted Usage:**
- ✅ **Code snippets and functions** for learning/development
- ✅ **Individual components** for other projects
- ✅ **Educational use** and study
- ❌ **Complete application clones** for commercial use
- ❌ **Direct market competition** using substantial portions

---

## 📚 **DEPENDENCY LICENSE ANALYSIS**

### **Key Dependencies & Their Licenses:**

#### **UI/Framework (Safe - Permissive Licenses)**
- **Next.js:** MIT License ✅
- **React:** MIT License ✅  
- **Tailwind CSS:** MIT License ✅
- **Radix UI:** MIT License ✅
- **Lucide React:** ISC License ✅

#### **Database/Backend (Safe - Permissive Licenses)**
- **Supabase:** Apache 2.0 License ✅
- **TypeScript:** Apache 2.0 License ✅

#### **Mapping (Safe - Permissive Licenses)**
- **Leaflet:** BSD-2-Clause License ✅
- **React-Leaflet:** BSD-2-Clause License ✅

#### **Utilities (Safe - Permissive Licenses)**
- **Zod:** MIT License ✅
- **Class Variance Authority:** Apache 2.0 License ✅
- **Date-fns:** MIT License ✅

### **✅ LICENSE FREEDOM CONFIRMED**
**All major dependencies use permissive licenses (MIT, Apache 2.0, BSD) that allow us to choose any license we want for our application, including restrictive ones.**

---

## 🛡️ **RECOMMENDED LICENSE OPTIONS**

### **Option 1: Business Source License (BSL) - RECOMMENDED** ⭐

**What it does:**
- Allows free use for **non-commercial purposes**
- Blocks **commercial competitors** from using your code
- After 4 years, automatically becomes Apache 2.0 (open source)
- Used by: MongoDB, CockroachDB, Elastic

**Pros:**
- ✅ Perfect protection against market saturation
- ✅ Allows educational/personal use
- ✅ Still appears "open source" to developers
- ✅ Builds community while protecting business
- ✅ Eventual open source conversion for long-term goodwill

**Cons:**
- ⚠️ Not technically "open source" (OSI-approved)
- ⚠️ May confuse some developers initially

**Example BSL License Text:**
```
Business Source License 1.1

License Grant: You may use, modify, and distribute the licensed work, 
provided that you do not use it for Commercial Use.

Commercial Use means any use that is primarily intended for commercial 
advantage or monetary compensation, including but not limited to:
- Operating a food truck discovery service
- Providing location-based restaurant/food services
- Commercial data aggregation of food vendor information

Change Date: January 20, 2029 (4 years from now)
Change License: Apache License 2.0
```

### **Option 2: Commons Clause + MIT**

**What it does:**
- MIT license + "Commons Clause" addition
- Prevents **selling the software** but allows everything else
- More permissive than BSL

**Pros:**
- ✅ Simpler than BSL
- ✅ Familiar MIT base
- ✅ Prevents direct commercial sales

**Cons:**
- ⚠️ Less protection than BSL (allows commercial use, just not sales)
- ⚠️ Competitors could still clone and offer for "free" while monetizing differently

### **Option 3: Dual Licensing (MIT + Commercial)**

**What it does:**
- Offer under MIT for open source use
- Require commercial license for business use
- Common in database and enterprise software

**Pros:**
- ✅ Maximum flexibility
- ✅ Revenue opportunity from license sales
- ✅ Clear legal framework

**Cons:**
- ⚠️ Complex to implement and enforce
- ⚠️ Requires legal framework for commercial licenses
- ⚠️ May limit adoption

### **Option 4: AGPL-3.0 (Strong Copyleft)**

**What it does:**
- Requires anyone using your code to open source their **entire application**
- Includes network use (SaaS applications)
- Very restrictive for commercial use

**Pros:**
- ✅ Strong protection against proprietary competitors
- ✅ Forces competitors to be open source too
- ✅ True open source license

**Cons:**
- ⚠️ May discourage legitimate contributors
- ⚠️ Very restrictive even for snippet usage
- ⚠️ Doesn't directly prevent market saturation

---

## 🏆 **FINAL RECOMMENDATION: Business Source License (BSL)**

### **Why BSL is Perfect for Your Situation:**

1. **Market Protection:** Prevents commercial food truck discovery clones
2. **Developer Friendly:** Allows snippet usage, learning, contributions
3. **Business Clarity:** Clear commercial vs. non-commercial distinction
4. **Future Planning:** Eventually becomes fully open source
5. **Industry Proven:** Used by successful tech companies

### **Implementation Strategy:**

1. **Create `LICENSE` file** with BSL 1.1 text
2. **Add copyright notice** to all source files
3. **Update README** with clear license explanation
4. **Add Contributing Guidelines** explaining the license choice

---

## 📝 **PROPOSED LICENSE IMPLEMENTATION**

### **License File Content:**
```
Business Source License 1.1

Licensed Work: Food Truck Finder
License Grant: You may copy, modify, and distribute the Licensed Work, 
provided that you do not use the Licensed Work for Commercial Use.

Commercial Use Definition:
Commercial Use means any use of the Licensed Work that is primarily 
intended for commercial advantage or monetary compensation, including 
but not limited to:

1. Operating a food truck discovery or location service
2. Providing commercial restaurant, food vendor, or dining location services  
3. Commercial aggregation or distribution of food vendor data
4. Integration into commercial food delivery or ordering platforms
5. White-label licensing of food location services

Non-Commercial Use includes:
- Personal use and development
- Educational purposes and research
- Non-profit organizations
- Code snippet usage in other projects
- Contributing back to this project

Change Date: January 20, 2029
Change License: Apache License, Version 2.0

Copyright (c) 2025 [Your Name/Company]

For commercial licensing inquiries, contact: [your-email]
```

### **README Addition:**
```markdown
## License & Commercial Use

This project is licensed under the Business Source License 1.1. 

**You can freely:**
- Use the code for personal/educational projects
- Submit contributions and improvements  
- Reference code snippets in your own projects
- Study the implementation for learning

**Commercial food truck/restaurant discovery services require a commercial license.**

Contact us for commercial licensing options.
```

---

## 🚀 **NEXT STEPS**

1. **[ ] Review and approve license choice** (BSL recommended)
2. **[ ] Create LICENSE file** with chosen license text
3. **[ ] Add copyright headers** to main source files  
4. **[ ] Update README.md** with license information
5. **[ ] Add CONTRIBUTING.md** explaining contribution process
6. **[ ] Update package.json** license field

---

## 📞 **LEGAL CONSIDERATIONS**

**Disclaimer:** This is research for decision-making purposes. For final implementation, consider:

- **Legal review** of license terms by an attorney
- **Trademark registration** for "Food Truck Finder" if desired
- **Terms of Service** for the live application
- **Privacy Policy** for user data collection

The BSL provides strong practical protection while maintaining developer goodwill and eventual open source conversion.

---

*This research prioritizes business protection while fostering a healthy development community around your innovative food truck discovery platform.*
