import Header from "components/Header";
import ArtifactsListPage from "src/pages/ArtifactsListPage/index.ts";
import ArtifactPage from "src/pages/ArtifactPage/index.ts";
import {Route, Routes} from "react-router-dom";
import {Container, Row} from "reactstrap";
import {Breadcrumbs} from "./components/Breadcrumbs/Breadcrumbs.tsx";
import LoginPage from "pages/LoginPage";
import RegisterPage from "pages/RegisterPage";
import AnalysisRequestsPage from "src/pages/AnalysisRequestsPage/index.ts";
import AnalysisRequestPage from "pages/AnalysisRequestPage";
import ProfilePage from "pages/ProfilePage";
import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {handleCheck} from "store/slices/userSlice.ts";
import NotFoundPage from "pages/NotFoundPage";
import {AccessDeniedPage} from "pages/AccessDeniedPage/AccessDeniedPage.tsx";
import "./styles.css"
import HomePage from "pages/HomePage/HomePage.tsx";

function App() {

    const dispatch = useAppDispatch()

    const {checked} = useAppSelector((state) => state.user)

    useEffect(() => {
        dispatch(handleCheck())
    }, []);

    if (!checked) {
        return <></>
    }

    return (
        <div>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs />
                </Row>
                <Row>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login/" element={<LoginPage />} />
                        <Route path="/register/" element={<RegisterPage />} />
                        <Route path="/artifacts/" element={<ArtifactsListPage />} />
                        <Route path="/artifacts/:id/" element={<ArtifactPage />} />
                        <Route path="/analysis_requests/" element={<AnalysisRequestsPage />} />
                        <Route path="/analysis_requests/:id/" element={<AnalysisRequestPage />} />
                        <Route path="/profile/" element={<ProfilePage />} />
                        <Route path="/403/" element={<AccessDeniedPage />} />
                        <Route path="/404/" element={<NotFoundPage />} />
                        <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
