# AI Entrypoint — Coffee-Sim

Coffee-Sim is an educational coffee extraction simulator.

The application allows users to explore how brewing parameters influence flavour.

The simulator is not scientifically exact.  
It is an educational model designed to illustrate extraction behaviour.

---

# Core Architecture

Coffee-Sim is divided into two layers:

UI Layer  
Simulation Engine

UI handles interaction and visualisation.

The engine performs all brewing calculations.

---

# Main Flow

User Controls  
→ SimulatorPage reducer  
→ simulationEngine dispatcher  
→ brew method engine  
→ SimulationResult  
→ visualisation components

---

# Important Files

SimulatorPage.tsx  
Main orchestration and reducer.

SimulatorControlsPanel.tsx  
Renders controls depending on brew method.

simulationEngine.ts  
Dispatches simulation to the correct brewing engine.

espressoEngine.ts  
Reference implementation for brewing logic.

components/types/engines.ts  
Defines shared types.

dictionaries/es.json  
dictionaries/en.json  
UI text.

---

# Brew Methods

Current supported methods:

espresso  
v60  
french_press  
aeropress  
moka  
cold_brew

Each method has its own simulation engine.

---

# Important Rule

All brewing logic must stay inside `/engine`.

UI components must not implement brewing calculations.

---

# How to Navigate the Repo

For simulation changes:

→ inspect `/engine`

For UI behaviour:

→ inspect `/components`

For brew parameters:

→ inspect `/components/controls`

For text:

→ inspect `/dictionaries`

---

# Modification Guidelines

Make targeted changes.

Avoid exploring unrelated files.

Do not introduce new dependencies.