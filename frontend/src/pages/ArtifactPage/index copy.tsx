import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {T_Artifact} from "src/modules/types.ts";
import {Col, Container, Row} from "reactstrap";
import {ArtifactMocks} from "src/modules/mocks.ts";
import mockImage from "assets/mock.png";

type Props = {
    selectedArtifact: T_Artifact | null,
    setSelectedArtifact: React.Dispatch<React.SetStateAction<T_Artifact | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const ArtifactPage = ({selectedArtifact, setSelectedArtifact, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/artifacts/${id}`)
            const data = await response.json()
            setSelectedArtifact(data)
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        setSelectedArtifact(ArtifactMocks.find(artifact => artifact?.id == parseInt(id as string)) as T_Artifact)
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => setSelectedArtifact(null)
    }, []);

    if (!selectedArtifact) {
        return (
            <div>

            </div>
        )
    }

    return (
        <Container>
            <Row>
                <Col md="6">
                    <img
                        alt=""
                        src={isMock ? mockImage as string : selectedArtifact.image}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedArtifact.title}</h1>
                    <p className="fs-5">Описание: {selectedArtifact.description}</p>
                    <p className="fs-5">Индекс влияния: {selectedArtifact.base_influence_score}.</p>
                </Col>
            </Row>
        </Container>
    );
};

export default ArtifactPage