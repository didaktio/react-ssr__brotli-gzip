import { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore
import logo from './react-logo.svg';
import { Time } from './Time/Time';
import './Clock.scss';
import { Formats, FormatsClickEvent } from './Formats/Formats';
import { Speed, speedToMilliseconds, TimeFormat } from './helpers';
import { Speeds, SpeedsClickEvent } from './Speeds/Speeds';


export const Clock = () => {
    // Demonstration of useState: https://reactjs.org/docs/hooks-state.html.
    // Set some initial state and cast to interface. We use two lots of
    // destructuring to expose the values.
    const [{
        isRunning,
        seconds,
        format,
        displayFormats,
        speed,
        displaySpeeds
    },
        setState
    ] = useState({
        ...(getLocalState() || {
            isRunning: false,
            seconds: 0,
            format: 'seconds',
            displayFormats: false,
            speed: '1x',
            displaySpeeds: false
        })
    } as ClockState),
        isHydrated = useIsHydrated(),
        // Demonstration of useRef. Storing the tickerId in state is unnecessary and friendly to bugs.
        // useRef enables us to persist values for the entire lifetime of the component. It is set
        // by the useEffect hook below.
        tickerId = useRef(null as any),

        // Demonstration of useMemo. This component will render with each tick, but the buttons
        // only change with user engagement (ie when the clock is stopped/started). So we
        // cache or 'memoize' the element to capture the return value and repeatedly use it
        // until the specified dependencies change (ie isRunning).
        buttons = useMemo(() => Buttons({
            clockIsRunning: isRunning,
            onClick: ({ target: { id } }: ButtonsClickEvent) => setState(state =>
                id === 'start-button' ? { ...state, isRunning: true }
                    : id === 'stop-button' ? { ...state, isRunning: false }
                        : { ...state, seconds: 0 })
        }), [isRunning]),

        // Demonstration of creating event handlers outside html to avoid recreation of the same functions on re-render:
        // https://reactjs.org/docs/faq-functions.html
        handleClick = ((e: SyntheticEvent) =>
            (e as ClockClickEvent).target.id === 'image' && !displaySpeeds ? setState(state => ({ ...state, displaySpeeds: true })) :
                (displayFormats || displaySpeeds) ? setState(state => ({ ...state, displayFormats: false, displaySpeeds: false }))
                    : false),
        handleSpeedClick = ({ target: { id: selectedSpeed } }: SpeedsClickEvent) =>
            selectedSpeed !== speed ? setState(state => ({ ...state, speed: selectedSpeed })) : false,
        handleTimeClick = (e: SyntheticEvent) => setState(state => ({ ...state, displayFormats: true })),
        handleFormatClick = ({ target: { id: newFormat } }: FormatsClickEvent) =>
            setState(state => ({ ...state, displayFormats: false, format: newFormat }));


    // Demonstration of useEffect: https://reactjs.org/docs/hooks-effect.html.
    // Runs only when isRunning or speed changes: if true, create an interval and store its ID with useRef.
    // else (and) if a tickerId is stored then it must be a stop operation, so we clear the interval.
    useEffect(() => {
        if (tickerId.current) clearInterval(tickerId.current);
        if (isRunning) tickerId.current = setInterval(() => setState(state => ({ ...state, seconds: state.seconds + 1 })), speedToMilliseconds(speed));
        return () => clearInterval(tickerId.current);
    }, [isRunning, speed]);


    // Update local storage every time the state changes.
    useEffect(() => setLocalState({
        isRunning,
        seconds,
        format,
        displayFormats,
        speed,
        displaySpeeds
    }), [
        isRunning,
        seconds,
        format,
        displayFormats,
        speed,
        displaySpeeds
    ]);

    return (
        <div
            className='clock-wrapper'
            onClick={handleClick}>

            <div className='Clock'>
                {
                    displaySpeeds &&
                    <Speeds
                        className='Clock__speeds-popover'
                        currentSpeed={speed}
                        onClick={handleSpeedClick}
                    />
                }

                {/* Demonstration of conditional class names. */}
                <img
                    id='image'
                    className={`Clock__image${` Clock__image--${speed}`}${seconds ? ' Clock__image--animation' : ''}${seconds ? (isRunning ? ' Clock__image--play' : ' Clock__image--pause') : ''}`}
                    src={logo}
                    alt='React logo'
                />

                {/* Demonstration of conditional rendering. */}
                {
                    displayFormats &&
                    <Formats
                        className='Clock__formats-popover'
                        currentFormat={format}
                        seconds={seconds}
                        onClick={handleFormatClick}
                    />
                }
                <div className='Clock__time'>
                    <Time
                        format={format}
                        seconds={seconds}
                        onClick={handleTimeClick} />
                </div>

                {isHydrated && buttons}

            </div>
        </div>
    );
}

// Demonstration of smart event listening (browser's charge more than you think for events).
// We listen to all buttons via a single listener on the parent, and use JavaScript to determine what was clicked.
const Buttons = ({ onClick, clockIsRunning }: { onClick: Function; clockIsRunning: boolean; }) => (
    <div
        className='Buttons'
        onClick={e => onClick(e)}>
        <button
            disabled={clockIsRunning}
            id='start-button'
            className={`Buttons__start-button${clockIsRunning ? ' Buttons__button--disabled' : ''}`}>Start</button>
        <button
            disabled={!clockIsRunning}
            id='stop-button'
            className={`Buttons__stop-button${!clockIsRunning ? ' Buttons__button--disabled' : ''}`}>Stop</button>
        <button
            id='reset-button'
            className='Buttons__reset-button'>Reset</button>

    </div>
);

declare var REACT_APP_CLOCK_SSR_LOCAL_STATE_KEY: string;
// Environment variable injected via DefinePlugin: https://webpack.js.org/plugins/define-plugin/
// And more: https://stackoverflow.com/questions/55185601/webpack-process-env-undefined-using-defineplugin-and-dotenv/65264701#65264701

const _localStateKey = REACT_APP_CLOCK_SSR_LOCAL_STATE_KEY,
    getLocalState = () =>
        // [SSR] Check if localStorage exists, else return an empty object. This is
        // purely for server-side rendered HTML, which doesn't have access to the window.
        // useEffect hooks will only execute post-hydration, hence this check is unnecessary
        // for setLocalState. Another method would be an additional useEffect hook which updates
        // the state post-hydration, but this is not preferred because it entails one more render.
        (typeof window !== 'undefined' && localStorage ?
            JSON.parse(localStorage.getItem(_localStateKey) as any)
            : {}) as Partial<ClockState>
    ,
    setLocalState = (state: ClockState) => localStorage.setItem(_localStateKey, JSON.stringify(state));


// [SSR] Custom hook to abstract out logic determining whether app has been hydrated.
// Another method would be to combine
const useIsHydrated = () => {
    const [isHydrated, setIsHydrated] = useState(false)
    useEffect(() => {
        setIsHydrated(true)
    }, []);
    return isHydrated;
}


interface ClockState {
    isRunning: boolean;
    seconds: number;
    format: TimeFormat;
    displayFormats?: boolean;
    speed: Speed;
    displaySpeeds?: boolean;
};



// Customise Synthetic Events
interface ClockClickEvent extends SyntheticEvent { target: ClockElement; };
interface ClockElement extends Omit<HTMLDivElement, 'id'> { id: 'image' | string; };

interface ButtonsClickEvent extends SyntheticEvent { target: ButtonsButtonElement; };
interface ButtonsButtonElement extends Omit<HTMLDivElement, | 'id'> { id: 'start-button' | 'stop-button' | 'reset-button'; };
