import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { DragonsPage } from "../pages/DragonsPage";
import { DragonDossierPage } from "../pages/DragonDossierPage";


export const router = createBrowserRouter([
    { path: "/", element: <LoginPage /> },
    { path: "/dragons", element: <DragonsPage /> },
    { path: "/dragons/:id", element: <DragonDossierPage /> },
]);
