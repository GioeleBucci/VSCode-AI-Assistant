/**
 * Interface for commands that modify code within the current editor.
 */
export interface EditorTransformer {
    /**
     * Performs the code transformation.
     */
    applyTransformation(): Promise<void>;
}
