import { Fragment } from "react"

/** Renders the design's literal line breaks while keeping the sentence readable as one string. */
export default function BrokenLines({ lines, text }) {
  return (
    <span aria-label={text}>
      {lines.map((line, i) => (
        <Fragment key={line}>
          {i > 0 && <br />}
          <span aria-hidden="true">{line}</span>
        </Fragment>
      ))}
    </span>
  )
}
