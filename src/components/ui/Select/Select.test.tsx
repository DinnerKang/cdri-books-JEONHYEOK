import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Select, { type SelectOption } from './Select';

const mockOptions: SelectOption[] = [
  { value: 'option1', label: '옵션 1' },
  { value: 'option2', label: '옵션 2' },
  { value: 'option3', label: '옵션 3' },
];
const mockOnChange = vi.fn();

const defaultProps = {
  options: mockOptions,
  value: 'option1',
  onChange: mockOnChange,
};
describe('Select', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('선택된 값이 표시된다', () => {
    render(<Select {...defaultProps} />);

    expect(screen.getByText('옵션 1')).toBeInTheDocument();
  });

  it('클릭하면 드롭다운이 열린다', async () => {
    const user = userEvent.setup();

    render(<Select {...defaultProps} />);

    // 트리거 클릭
    const trigger = screen.getByText('옵션 1').closest('div');
    await user.click(trigger!);

    // 모든 옵션들이 보임
    expect(screen.getByText('옵션 2')).toBeInTheDocument();
    expect(screen.getByText('옵션 3')).toBeInTheDocument();
  });

  it('옵션을 클릭하면 값이 변경된다', async () => {
    const user = userEvent.setup();

    render(<Select {...defaultProps} />);

    // 드롭다운 열기
    const trigger = screen.getByText('옵션 1').closest('div');
    await user.click(trigger!);

    // 다른 옵션 클릭
    await user.click(screen.getByText('옵션 2'));

    // onChange가 호출됨
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  it('외부를 클릭하면 드롭다운이 닫힌다', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Select {...defaultProps} />
        <div data-testid="outside">외부 영역</div>
      </div>
    );

    // 드롭다운 열기
    const trigger = screen.getByText('옵션 1').closest('div');
    await user.click(trigger!);

    expect(screen.getByText('옵션 2')).toBeInTheDocument();

    // 외부 영역 클릭
    await user.click(screen.getByTestId('outside'));

    // 드롭다운이 닫힘
    expect(screen.queryByText('옵션 2')).not.toBeInTheDocument();
  });
});
