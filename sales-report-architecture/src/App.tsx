import { Navigate, Route, Routes } from "react-router-dom";
import HandwrittenCorrectionDemoPage from "./HandwrittenCorrectionDemoPage";
import ProjectScheduleMockPage from "./ProjectScheduleMockPage";
import SalesReportAutomationArchitecture from "./SalesReportAutomationArchitecture";

export default function App() {
  return (
    <Routes>
      <Route path="/sales-report" element={<SalesReportAutomationArchitecture />} />
      <Route path="/handwritten-demo" element={<HandwrittenCorrectionDemoPage />} />
      <Route path="/project-schedule" element={<ProjectScheduleMockPage />} />
      <Route path="/" element={<Navigate to="/sales-report" replace />} />
      <Route path="*" element={<Navigate to="/sales-report" replace />} />
    </Routes>
  );
}
