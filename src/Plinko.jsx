import React, { useState } from "react";
import PlinkoCanvas from "./PlinkoCanvas";
import "./Plinko.css";

const Plinko = () => {
  const [ballDropped] = useState(false);

  return (
    <div className="plinko-container">
      <PlinkoCanvas ballDropped={ballDropped} />
    </div>
  );
};

export default Plinko;
