import "./LoadingPage.css";

export default function LoadingPage() {
  return (
    <div className="ldp-root">
      {/* Background ripple rings */}
      <div className="ldp-ring ldp-ring--1" />
      <div className="ldp-ring ldp-ring--2" />
      <div className="ldp-ring ldp-ring--3" />

      <div className="ldp-center">
        {/* Logo pop-in with glow */}
        <div className="ldp-logo-wrap">
          <img src="/logo/logo.png" alt="InsightERP" className="ldp-logo" />
        </div>

        {/* Name fades in after logo */}
        <h1 className="ldp-name">InsightERP</h1>
        <p className="ldp-tagline">Enterprise Resource Planning</p>

        {/* Dot loader */}
        <div className="ldp-dots">
          <span className="ldp-dot" />
          <span className="ldp-dot" />
          <span className="ldp-dot" />
        </div>
      </div>
    </div>
  );
}