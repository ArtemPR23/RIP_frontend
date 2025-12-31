import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {T_Artifact} from "src/modules/types.ts";
import ArtifactCard from "src/components/ArtifactCard";
import {ArtifactMocks} from "src/modules/mocks.ts";
import {FormEvent, useEffect} from "react";
import * as React from "react";

type Props = {
    artifacts: T_Artifact[],
    setArtifacts: React.Dispatch<React.SetStateAction<T_Artifact[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
    artifactName: string,
    setArtifactName: React.Dispatch<React.SetStateAction<string>>
}

const ArtifactsListPage = ({artifacts, setArtifacts, isMock, setIsMock, artifactName, setArtifactName}:Props) => {

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/artifacts/?title=${artifactName.toLowerCase()}`)
            const data = await response.json()
            setArtifacts(data.artifacts)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    const createMocks = () => {
        setIsMock(true)
        setArtifacts(ArtifactMocks.filter(artifact => artifact.title.toLowerCase().includes(artifactName.toLowerCase())))
    }

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault()
        if (isMock) {
            createMocks()
        } else {
            await fetchData()
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md="8">
                                <Input value={artifactName} onChange={(e) => setArtifactName(e.target.value)} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row>
                {artifacts?.map(artifact => (
                    <Col key={artifact.id} xs="4">
                        <ArtifactCard artifact={artifact} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default ArtifactsListPage