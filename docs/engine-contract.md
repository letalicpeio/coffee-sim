# Engine Contract — Coffee-Sim

All brew methods must follow a common simulation contract.

The simulation engine dispatches calculations to a specific brew engine.

---

# Simulation Entry

simulationEngine.ts receives:

brew method  
brewing parameters

The dispatcher routes the call to the appropriate engine.

---

# Engine Responsibilities

Each brew engine must:

1. receive brewing parameters
2. calculate extraction behaviour
3. estimate flavour attributes
4. return a SimulationResult

---

# Return Type

All engines must return the same structure.

SimulationResult

Typical fields include:

flavour profile  
extraction state  
style classification  
text explanation

---

# Engines

espressoEngine.ts  
V60Engine.ts  
FrenchPressEngine.ts  
AeropressEngine.ts  
MokaEngine.ts  
ColdBrewEngine.ts

---

# Architectural Rule

Engines must remain independent from the UI.

They must contain pure logic.

They must not import React components.