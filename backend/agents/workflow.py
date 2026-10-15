from agents.state import AgentGraphState
from agents.nodes import (
    input_agent_node,
    analysis_agent_node,
    correction_agent_node,
    verification_agent_node,
    feedback_agent_node,
)

class AgenticWorkflow:
    def invoke(self, initial_state: AgentGraphState) -> AgentGraphState:
        # Step 1: Input Agent
        state = input_agent_node(initial_state)
        
        # Step 2: Grammar Analysis Agent
        state = analysis_agent_node(state)
        
        # Step 3, 4, 5: Correction & Verification with Decision Loop
        while True:
            state = correction_agent_node(state)
            state = verification_agent_node(state)
            
            # Decision Edge: Check if retry is needed and allowed
            if not state["needs_retry"]:
                break
                
        # Step 6: Feedback Agent
        state = feedback_agent_node(state)
        return state

gec_app = AgenticWorkflow()