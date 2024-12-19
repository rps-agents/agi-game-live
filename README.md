# AGI Game Live

<div align="center">

📖 [Documentation](https://rps-agents.github.io/agi-game-live/) | 🎯 [Examples](https://github.com/rps-agents/awesome-agi-game-live)

</div>

## ✨ Features

- 🕹️ React-based virtual avatar component
- 📺 Real-time screen capture and analysis
- 🧠 Integration with LLMs for gameplay analysis
- ❤️ Provides emotional companionship value
- 🔌 Highly customizable and extensible API

## 🎯 Use Cases

- 🎮 Virtual game companions
- 🤖 Real-time gameplay analysis
- 🧑‍🤝‍🧑 Emotional support avatars

## 🚀 Quick Start

### Prerequisites

- [Node.js 14+](https://nodejs.org/en/download/)
- [React 17+](https://reactjs.org/)

### Installation

To get started with AGI Game Live, clone the repository and install dependencies:

```bash
git clone https://github.com/rps-agents/agi-game-live.git
cd agi-game-live
npm install
```

### Usage

Import the `VirtualAvatar` component to integrate the virtual avatar into your application.

```jsx
import VirtualAvatar from 'agi-game-live';
import ScreenCapture from 'agi-game-live';

function App() {
  return (
    <div>
      <VirtualAvatar />
      <ScreenCapture>
        {/* Your game component here */}
      </ScreenCapture>
    </div>
  );
}

export default App;
```

### API Overview

- **ScreenCaptureManager**: Manage real-time analysis settings.
    - **enable(reportType: CaptureType, interval: number)**: Start real-time analysis with specified type and interval.
    - **disable()**: Stop real-time analysis.
    - **captureScreenOnce(type: CaptureType, refer: string)**: Perform a one-time analysis with specified type and reference.

- **VisibilityProvider**: Control the visibility of the virtual avatar.
  ```jsx
  const defaultContextValue = {
    isVisible: true,
    toggleVisibility: () => {},
  };
  ```

## Community & Contact

- [GitHub Issues](https://github.com/rps-agents/agi-game-live/issues). Best for reporting bugs and suggesting features.

## Contributors

<a href="https://github.com/rps-agents/agi-game-live/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=rps-agents/agi-game-live"  alt=""/>
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rps-agents/agi-game-live&type=Date)](https://star-history.com/#rps-agents/agi-game-live&Date)

---
