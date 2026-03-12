# Brew Method Registry — Coffee-Sim

This document lists all supported brewing methods in Coffee-Sim.

It provides a quick overview of:

- the engine responsible for the simulation
- the UI controls used to configure parameters
- the parameters supported by each method

This file helps developers and AI agents quickly understand the brewing system without exploring the entire repository.

---

# Supported Brew Methods

Current methods implemented in the simulator:

espresso  
v60  
french_press  
aeropress  
moka  
cold_brew

Each method follows the same architecture:

controls → simulationEngine → brew engine → SimulationResult → visualisation

---

# Method Definitions

## espresso

Engine  
engine/espressoEngine.ts

Controls  
components/controls/EspressoControls.tsx

Basic Parameters

- grind size
- brew ratio

Advanced Parameters

- temperature
- pressure
- water GH
- water KH

Notes

Espresso acts as the reference brewing model and historically was the first engine implemented.

---

## v60

Engine  
engine/V60Engine.ts

Controls  
components/controls/V60Controls.tsx

Basic Parameters

- grind size
- brew ratio
- brew temperature
- brew time

Advanced Parameters

- water GH
- water KH
- number of pours
- separate bloom

Notes

V60 represents pour-over brewing with multiple pours and bloom control.

---

## french_press

Engine  
engine/FrenchPressEngine.ts

Controls  
components/controls/FrenchPressControls.tsx

Basic Parameters

- grind size
- brew ratio
- brew time

Advanced Parameters

- water GH
- water KH
- precise brew temperature

Notes

Immersion brewing method with minimal agitation and long extraction time.

---

## aeropress

Engine  
engine/AeropressEngine.ts

Controls  
components/controls/AeropressControls.tsx

Basic Parameters

- grind size
- brew ratio
- temperature
- brew time

Advanced Parameters

- water GH
- water KH
- press intensity
- inverted method

Notes

Hybrid immersion/pressure brewing method.

---

## moka

Engine  
engine/MokaEngine.ts

Controls  
components/controls/MokaControls.tsx

Basic Parameters

- grind size
- brew ratio
- heat intensity

Advanced Parameters

- water GH
- water KH
- initial water temperature

Notes

Stovetop pressure brewing method.

---

## cold_brew

Engine  
engine/ColdBrewEngine.ts

Controls  
components/controls/ColdBrewControls.tsx

Basic Parameters

- grind size
- brew ratio
- brew time

Advanced Parameters

- water GH
- water KH
- fridge temperature

Notes

Long cold immersion extraction.

---

# Architectural Rules

All brewing methods must follow the engine contract.

Each method must include:

1. a simulation engine
2. UI controls for parameters
3. integration with simulationEngine.ts

---

# Adding New Methods

When introducing a new brewing method:

1. create a new engine in `/engine`
2. create a control component in `/components/controls`
3. integrate the method in `simulationEngine.ts`
4. update the UI selector
