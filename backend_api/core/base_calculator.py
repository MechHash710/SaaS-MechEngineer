from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

from .validators import ValidationAlert


@dataclass
class CalculationStep:
    step_name: str
    formula: str
    inputs: dict[str, Any]
    result: Any
    unit: str
    norm_reference: str = ""


@dataclass
class CalculationResult:
    steps: list[CalculationStep] = field(default_factory=list)
    summary: dict[str, Any] = field(default_factory=dict)
    warnings: list[ValidationAlert] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseCalculator(ABC):
    @abstractmethod
    def validate_inputs(self, data: Any) -> list[ValidationAlert]:
        """Validate inputs and return a list of warnings or explicitly raise an exception."""
        pass

    @abstractmethod
    async def calculate(self, data: Any) -> CalculationResult:
        """Execute the core calculation logic."""
        pass

    @abstractmethod
    def format_results(self, result: CalculationResult) -> Any:
        """Format the generic CalculationResult into the specific API output model."""
        pass
