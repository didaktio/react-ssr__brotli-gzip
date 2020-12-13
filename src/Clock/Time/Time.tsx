import { SyntheticEvent } from "react";
import { formatSeconds, TimeFormat } from "../helpers";
import './Time.scss';


// Demonstration of 'lifting state': https://reactjs.org/docs/lifting-state-up.html.
// The onClick handler is passed down by an ancestor (in this case, the Clock), making this component 'controlled'.
export const Time = ({
    format,
    seconds,
    onClick
}: {
    format: TimeFormat;
    seconds: number;
    onClick: (e: SyntheticEvent) => any;
}) => (
    <div className="Time">

        <div className="Time__text-container">

            <h3 className="Time__text"
                onClick={onClick}>
                {formatSeconds(format, seconds)}
            </h3>

        </div>

    </div>
);


