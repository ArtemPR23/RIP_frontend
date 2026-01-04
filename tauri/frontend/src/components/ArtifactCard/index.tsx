import {Button, Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import mockImage from "assets/mock.png";
import {Link} from "react-router-dom";
import {T_Artifact} from "modules/types.ts";

interface ArtifactCardProps {
    artifact: T_Artifact,
    isMock: boolean
}

const ArtifactCard = ({artifact, isMock}: ArtifactCardProps) => {
    return (
        <Card key={artifact.id} style={{width: '18rem', margin: "0 auto 50px" }}>
            <CardImg
                src={isMock ? mockImage as string : artifact.image}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {artifact.title}
                </CardTitle>
                <CardText>
                    Индекс влияние: {artifact.base_influence_score}.
                </CardText>
                <Link to={`/artifacts/${artifact.id}`}>
                    <Button color="primary">
                        Открыть
                    </Button>
                </Link>
            </CardBody>
        </Card>
    );
};

export default ArtifactCard