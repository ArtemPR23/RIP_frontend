import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import ArtifactPage from "src/pages/ArtifactPage";
import ArtifactsListPage from "src/pages/ArtifactsListPage";
import {Route, Routes} from "react-router-dom";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import {useState} from "react";
import {T_Artifact} from "modules/types.ts";

function App() {

    const [artifacts, setArtifact] = useState<T_Artifact[]>([])

    const [selectedArtifact, setSelectedArtifact] = useState<T_Artifact | null>(null)

    const [isMock, setIsMock] = useState(false);

    return (
        <>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedArtifact={selectedArtifact}/>
                </Row>
                <Row>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/artifacts/" element={<ArtifactsListPage artifacts={artifacts} setArtifact={setArtifact} isMock={isMock} setIsMock={setIsMock} />} />
                        <Route path="/artifacts/:id" element={<ArtifactPage selectedArtifact={selectedArtifact} setSelectedArtifact={setSelectedArtifact} isMock={isMock} setIsMock={setIsMock} />} />
                    </Routes>
                </Row>
            </Container>
        </>
    )
}

export default App
