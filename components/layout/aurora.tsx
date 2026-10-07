/** Fixed, slowly drifting colour field that sits behind every page. */
export const Aurora = () => (
    <div aria-hidden="true" className="aurora">
        <span className="aurora-blob aurora-1" />
        <span className="aurora-blob aurora-2" />
        <span className="aurora-blob aurora-3" />
        <span className="aurora-blob aurora-4" />
        <span className="aurora-blob aurora-5" />
        <span className="aurora-grain" />
    </div>
)
