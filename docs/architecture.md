# Architecture — Coffee-Sim

Coffee-Sim is built with:

Next.js  
TypeScript  
TailwindCSS

The project has no backend.

State is stored in the UI and optionally persisted in the URL.

---

# System Layers

## UI Layer

Responsible for:

- user controls
- brewing parameters
- visualisation
- radar charts
- extraction map

Location:

/components

Main components:

SimulatorPage  
SimulatorControlsPanel  
SimulatorResultPanel  
HybridRadarMap  
FlavorRadar  
ExtractionMap

---

## Simulation Engine

Responsible for:

- extraction calculations
- flavour estimation
- brewing behaviour modelling

Location:

/engine

The engine must remain completely independent from the UI.

Simulation logic must not exist inside React components.

---

# State Management

UI state is managed inside SimulatorPage.

A reducer controls parameter updates.

Changes to parameters trigger simulation updates.

---

# Data Flow

Controls  
→ reducer  
→ simulationEngine  
→ method engine  
→ SimulationResult  
→ UI visualisation