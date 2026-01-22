import {Link} from "react-router-dom";
import {Badge, Button} from "reactstrap";

type Props = {
    isActive: boolean,
    draft_analysis_request: string,
    artifacts_count: number
}

export const Bin = ({isActive, draft_analysis_request, artifacts_count}:Props) => {

    if (!isActive) {
        return <Button color={"secondary"} className="bin-wrapper" disabled>Корзина</Button>
    }

    return (
        <Link to={`/analysis_requests/${draft_analysis_request}/`} className="bin-wrapper">
            <Button color={"primary"} className="w-100 bin">
                Корзина
                <Badge>
                    {artifacts_count}
                </Badge>
            </Button>
        </Link>
    )
}