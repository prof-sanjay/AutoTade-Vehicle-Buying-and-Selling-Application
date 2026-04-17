import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import "./Feedback.css";

export default function Feedback() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [status, setStatus] = useState(null); 

    const user = JSON.parse(localStorage.getItem("user"));

    
    if (!user || user.role === "admin") {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!feedback.trim()) return;

        setStatus("submitting");

        try {
            const res = await fetch("http://localhost:5000/api/admin/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userid: user.id,
                    username: user.username,
                    feedback: feedback.trim()
                })
            });

            if (res.ok) {
                setStatus("success");
                setFeedback("");
                
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus(null);
                }, 2000);
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Feedback submission error:", error);
            setStatus("error");
        }
    };

    return (
        <div className="feedback-container">
            {isOpen && (
                <div className="feedback-popup">
                    <div className="feedback-header">
                        <h4>Send Feedback</h4>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    
                    {status === "success" ? (
                        <div className="feedback-success">
                            <p>Thank you for your feedback!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="feedback-form">
                            <textarea
                                placeholder="Tell us what you think in a sentence..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                                required
                            />
                            {status === "error" && (
                                <p className="feedback-error">Failed to send. Please try again.</p>
                            )}
                            <button 
                                type="submit" 
                                className="submit-btn" 
                                disabled={status === "submitting" || !feedback.trim()}
                            >
                                {status === "submitting" ? "Sending..." : (
                                    <>
                                        Send <Send size={14} style={{ marginLeft: "5px" }} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {!isOpen && (
                <button 
                    className="feedback-toggle-btn" 
                    onClick={() => setIsOpen(true)}
                    title="Provide Feedback"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
}
