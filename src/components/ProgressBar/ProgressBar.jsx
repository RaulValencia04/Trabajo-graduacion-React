import React, { useEffect } from "react";
import "./ProgressBar.css";

const ProgressBar = () => {
  useEffect(() => {
    const steps = document.querySelectorAll(".step");
    
    setTimeout(() => {
      steps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add("done");
        }, 1250 * index); // Ajuste del tiempo para animar correctamente cada paso
      });
    }, 500);
  }, []);

  return (
    <><h1 className="mb-5 title">PROGRESO</h1>
    <div className="container">
      
      <div className="progress2">
        <div className="step">
          <div className="step-progress"></div>
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">ACEPTACION</div>
          </div>
        </div>
        <div className="step">
          <div className="step-progress"></div>
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">1º entrega</div>
          </div>
        </div>
        <div className="step">
          <div className="step-progress"></div>
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">2º entrega</div>
          </div>
        </div>
        <div className="step">
          <div className="step-progress"></div>
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">3º entrega</div>
          </div>
        </div>
        <div className="step">
          <div className="step-progress"></div>
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">4º entrega</div>
          </div>
        </div>
        <div className="step">
          <div className="step-progress"></div>
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">5º entrega</div>
          </div>
          
        </div>
        <div className="step">
          {/* <div className="step-progress"></div> */}
          <div className="icon-wrapper">
            <svg className="icon icon-checkmark" viewBox="0 0 32 32">
              <path className="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
            </svg>
            <div className="step-text">final entrega</div>
          </div>
          
        </div>
      </div>
    </div>
    </>
  );
};

export default ProgressBar;
